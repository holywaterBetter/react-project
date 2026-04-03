import orgStructureJson from '@assets/org_structure_300.json';
import type {
  ApprovalChangeRequest,
  ApprovalChangeRow,
  CreateApprovalRequestPayload
} from '@features/approval/types/approval';
import {
  canApproveChanges,
  canSeeAllDivisions,
  getDivisionNameByCode,
  type DevUserMode
} from '@features/auth/types/devUserMode';
import type { OrganizationCategorySummary, OrganizationDivisionSummary, OrganizationRecord, OrganizationTreeNode } from '@shared-types/org';
import { useSyncExternalStore } from 'react';

type WorkforceRepositoryState = {
  organizations: OrganizationRecord[];
  approvals: ApprovalChangeRequest[];
};

const STORAGE_KEY = 'enterprise-react-starter/workforce-repository/v1';

const seedOrganizations = [...(orgStructureJson as OrganizationRecord[])].sort((left, right) =>
  left.org_code.localeCompare(right.org_code)
);
const seedOrganizationByCode = new Map(seedOrganizations.map((record) => [record.org_code, record]));

const listeners = new Set<() => void>();
let cachedState: WorkforceRepositoryState | null = null;
let version = 0;

const cloneRecord = (record: OrganizationRecord): OrganizationRecord => ({ ...record });

const cloneChangeRow = (row: ApprovalChangeRow): ApprovalChangeRow => ({
  ...row,
  before: { ...row.before },
  after: { ...row.after },
  changedFields: row.changedFields.map((field) => ({ ...field }))
});

const cloneApprovalRequest = (request: ApprovalChangeRequest): ApprovalChangeRequest => ({
  ...request,
  changedRows: request.changedRows.map(cloneChangeRow),
  decision: request.decision ? { ...request.decision } : null
});

const cloneState = (state: WorkforceRepositoryState): WorkforceRepositoryState => ({
  organizations: state.organizations.map(cloneRecord),
  approvals: state.approvals.map(cloneApprovalRequest)
});

const reconcileOrganizationRecord = (record: OrganizationRecord): OrganizationRecord => {
  const seedRecord = seedOrganizationByCode.get(record.org_code);
  return seedRecord ? { ...seedRecord, ...record } : cloneRecord(record);
};

const reconcileOrganizations = (organizations: OrganizationRecord[]) => {
  const storedByCode = new Map(organizations.map((record) => [record.org_code, record]));

  return seedOrganizations.map((seedRecord) => {
    const storedRecord = storedByCode.get(seedRecord.org_code);
    return storedRecord ? { ...seedRecord, ...storedRecord } : cloneRecord(seedRecord);
  });
};

const reconcileApprovalRequest = (request: ApprovalChangeRequest): ApprovalChangeRequest => ({
  ...request,
  changedRows: request.changedRows.map((row) => ({
    ...row,
    before: reconcileOrganizationRecord(row.before),
    after: reconcileOrganizationRecord(row.after),
    changedFields: row.changedFields.map((field) => ({ ...field }))
  })),
  decision: request.decision ? { ...request.decision } : null
});

const readStoredState = (): WorkforceRepositoryState | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as WorkforceRepositoryState;

    if (!Array.isArray(parsed.organizations) || !Array.isArray(parsed.approvals)) {
      return null;
    }

    return {
      organizations: reconcileOrganizations(parsed.organizations as OrganizationRecord[]),
      approvals: (parsed.approvals as ApprovalChangeRequest[]).map(reconcileApprovalRequest)
    };
  } catch {
    return null;
  }
};

const getInitialState = (): WorkforceRepositoryState => ({
  organizations: seedOrganizations.map(cloneRecord),
  approvals: []
});

const ensureState = () => {
  if (!cachedState) {
    cachedState = readStoredState() ?? getInitialState();
  }

  return cachedState;
};

const persistState = (nextState: WorkforceRepositoryState) => {
  cachedState = cloneState(nextState);
  version += 1;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedState));
  }

  listeners.forEach((listener) => listener());
};

const scopeOrganizations = (organizations: OrganizationRecord[], user: DevUserMode) => {
  if (canSeeAllDivisions(user)) {
    return organizations.map(cloneRecord);
  }

  const divisionCode = user.divisionCode;
  const divisionName = getDivisionNameByCode(user.divisionCode);

  if (!divisionCode && !divisionName) {
    return [];
  }

  return organizations
    .filter(
      (record) =>
        record.org_division_code === divisionCode || record.org_code === divisionCode || record.org_division_name === divisionName
    )
    .map(cloneRecord);
};

const buildOrganizationTree = (organizations: OrganizationRecord[], rootOrgCode?: string): OrganizationTreeNode[] => {
  const byParent = organizations.reduce<Map<string, OrganizationRecord[]>>((map, record) => {
    const current = map.get(record.upper_org_code) ?? [];
    current.push(record);
    map.set(record.upper_org_code, current);
    return map;
  }, new Map());
  const codeSet = new Set(organizations.map((record) => record.org_code));

  const buildNode = (record: OrganizationRecord): OrganizationTreeNode => ({
    ...record,
    children: (byParent.get(record.org_code) ?? []).map(buildNode)
  });

  if (rootOrgCode) {
    const root = organizations.find((record) => record.org_code === rootOrgCode);
    return root ? [buildNode(root)] : [];
  }

  return organizations
    .filter((record) => !codeSet.has(record.upper_org_code))
    .map(buildNode);
};

const nowIso = () => new Date().toISOString();

const createRequestId = () => `approval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const applyRowsToOrganizations = (organizations: OrganizationRecord[], rows: OrganizationRecord[]) => {
  const updatesByCode = new Map(rows.map((row) => [row.org_code, row]));
  return organizations.map((record) => {
    const update = updatesByCode.get(record.org_code);
    return update ? { ...update } : { ...record };
  });
};

export const workforceRepository = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getVersion() {
    return version;
  },

  getEffectiveOrganizations() {
    return ensureState().organizations.map(cloneRecord);
  },

  getScopedOrganizations(user: DevUserMode) {
    return scopeOrganizations(ensureState().organizations, user);
  },

  getOrganizationTree(user: DevUserMode, rootOrgCode?: string) {
    return buildOrganizationTree(this.getScopedOrganizations(user), rootOrgCode);
  },

  getOrganizationByCode(user: DevUserMode, orgCode: string) {
    return this.getScopedOrganizations(user).find((record) => record.org_code === orgCode) ?? null;
  },

  getOrganizationCategories(user: DevUserMode): OrganizationCategorySummary[] {
    const categories = this.getScopedOrganizations(user).reduce<Map<string, OrganizationCategorySummary>>((map, record) => {
      const current = map.get(record.org_category_code);

      if (current) {
        current.count += 1;
        return map;
      }

      map.set(record.org_category_code, {
        categoryCode: record.org_category_code,
        categoryName: record.org_category_name,
        count: 1
      });
      return map;
    }, new Map());

    return [...categories.values()].sort((left, right) => left.categoryCode.localeCompare(right.categoryCode));
  },

  getOrganizationDivisions(user: DevUserMode): OrganizationDivisionSummary[] {
    const divisions = this.getScopedOrganizations(user).reduce<Map<string, OrganizationDivisionSummary>>((map, record) => {
      const current = map.get(record.org_division_name);

      if (current) {
        current.count += 1;
        return map;
      }

      map.set(record.org_division_name, {
        divisionCode: record.org_division_name,
        divisionName: record.org_division_name,
        count: 1
      });
      return map;
    }, new Map());

    return [...divisions.values()].sort((left, right) => left.divisionName.localeCompare(right.divisionName, 'ko'));
  },

  applyOrganizationRows(rows: OrganizationRecord[]) {
    const state = ensureState();
    persistState({
      ...state,
      organizations: applyRowsToOrganizations(state.organizations, rows)
    });
  },

  createPendingChangeRequest({ submittedBy, rows }: CreateApprovalRequestPayload) {
    if (rows.length === 0) {
      return null;
    }

    const state = ensureState();
    const nextRequest: ApprovalChangeRequest = {
      id: createRequestId(),
      status: 'pending',
      submittedAt: nowIso(),
      submittedByUserId: String(submittedBy.empNo),
      submittedByLabel: `${submittedBy.role} · ${submittedBy.name}`,
      divisionName: rows[0].divisionName,
      changedRows: rows.map(cloneChangeRow),
      totalChangedRows: rows.length,
      decision: null
    };

    persistState({
      ...state,
      approvals: [nextRequest, ...state.approvals]
    });

    return cloneApprovalRequest(nextRequest);
  },

  listPendingChangeRequests(user: DevUserMode) {
    const requests = ensureState().approvals;

    if (canApproveChanges(user)) {
      return requests.map(cloneApprovalRequest);
    }

    return requests
      .filter((request) => request.submittedByUserId === String(user.empNo))
      .map(cloneApprovalRequest);
  },

  getChangeRequestById(user: DevUserMode, requestId: string) {
    return this.listPendingChangeRequests(user).find((request) => request.id === requestId) ?? null;
  },

  applyApprovedChanges(requestId: string, decidedBy: DevUserMode, note: string) {
    const state = ensureState();
    const request = state.approvals.find((item) => item.id === requestId);

    if (!request || request.status !== 'pending') {
      return null;
    }

    const nextApprovals = state.approvals.map((item) =>
      item.id === requestId
        ? {
            ...item,
            status: 'approved' as const,
            decision: {
              note,
              decidedAt: nowIso(),
              decidedByUserId: String(decidedBy.empNo),
              decidedByLabel: `${decidedBy.role} · ${decidedBy.name}`
            }
          }
        : item
    );

    persistState({
      organizations: applyRowsToOrganizations(
        state.organizations,
        request.changedRows.map((row) => row.after)
      ),
      approvals: nextApprovals
    });

    return nextApprovals.find((item) => item.id === requestId) ?? null;
  },

  rejectChangeRequest(requestId: string, decidedBy: DevUserMode, note: string) {
    const state = ensureState();
    const request = state.approvals.find((item) => item.id === requestId);

    if (!request || request.status !== 'pending') {
      return null;
    }

    const nextApprovals = state.approvals.map((item) =>
      item.id === requestId
        ? {
            ...item,
            status: 'rejected' as const,
            decision: {
              note,
              decidedAt: nowIso(),
              decidedByUserId: String(decidedBy.empNo),
              decidedByLabel: `${decidedBy.role} · ${decidedBy.name}`
            }
          }
        : item
    );

    persistState({
      ...state,
      approvals: nextApprovals
    });

    return nextApprovals.find((item) => item.id === requestId) ?? null;
  },

  resetForTests() {
    cachedState = getInitialState();
    version = 0;

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    listeners.forEach((listener) => listener());
  },

  reloadFromStorageForTests() {
    cachedState = null;
  }
};

export const useWorkforceRepositoryVersion = () =>
  useSyncExternalStore(workforceRepository.subscribe, workforceRepository.getVersion, workforceRepository.getVersion);
