import { useDevUserMode } from '@features/auth/context/DevUserModeContext';
import { canSeeAllDivisions, getDivisionNameByCode } from '@features/auth/types/devUserMode';
import { approvalService } from '@services/approvalService';
import { excelService } from '@services/excelService';
import { organizationService } from '@services/organizationService';
import { useWorkforceRepositoryVersion } from '@services/workforceRepository';
import type {
  OrganizationCategorySummary,
  OrganizationDivisionSummary,
  OrganizationQueryState,
  OrganizationRecord,
  OrganizationSortDirection,
  OrganizationSortField,
  OrganizationUploadValidationError
} from '@shared-types/org';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';

const DEFAULT_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

export const useOrganizations = () => {
  const { activeUser } = useDevUserMode();
  const repositoryVersion = useWorkforceRepositoryVersion();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [divisionCode, setDivisionCode] = useState(getDivisionNameByCode(activeUser.divisionCode) ?? '');
  const [categoryCode, setCategoryCode] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortField, setSortField] = useState<OrganizationSortField>('updated_date');
  const [sortDirection, setSortDirection] = useState<OrganizationSortDirection>('desc');
  const [rows, setRows] = useState<OrganizationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<OrganizationUploadValidationError[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<string | null>(null);
  const [categories, setCategories] = useState<OrganizationCategorySummary[]>([]);
  const [divisions, setDivisions] = useState<OrganizationDivisionSummary[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<OrganizationRecord[]>([]);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    setPage(0);
    setSelectedRowIds([]);
    setUploadSummary(null);
    setUploadErrors([]);
    setError(null);

    if (canSeeAllDivisions(activeUser)) {
      return;
    }

    setDivisionCode(getDivisionNameByCode(activeUser.divisionCode) ?? '');
  }, [activeUser]);

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      try {
        const [categoryOptions, divisionOptions, organizations] = await Promise.all([
          organizationService.getOrganizationCategories(activeUser),
          organizationService.getOrganizationDivisions(activeUser),
          organizationService.getOrganizationsForExport(activeUser, {
            filters: {
              search: '',
              divisionCode: '',
              categoryCode: ''
            },
            pagination: {
              page: 0,
              pageSize: 5000
            },
            sort: {
              field: 'updated_date',
              direction: 'desc'
            }
          })
        ]);

        if (!isMounted) {
          return;
        }

        setCategories(categoryOptions);
        setDivisions(divisionOptions);
        setAllOrganizations(organizations);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Failed to load organization options.');
      }
    };

    void loadOptions();

    return () => {
      isMounted = false;
    };
  }, [activeUser, repositoryVersion]);

  const queryState = useMemo<OrganizationQueryState>(
    () => ({
      filters: {
        search: debouncedSearch,
        divisionCode: canSeeAllDivisions(activeUser) ? divisionCode : '',
        categoryCode
      },
      pagination: {
        page,
        pageSize
      },
      sort: {
        field: sortField,
        direction: sortDirection
      }
    }),
    [activeUser, categoryCode, debouncedSearch, divisionCode, page, pageSize, sortDirection, sortField]
  );

  const departmentHierarchyByCode = useMemo(() => {
    const organizationByCode = new Map(allOrganizations.map((row) => [row.org_code, row]));

    return allOrganizations.reduce<Record<string, string>>((accumulator, row) => {
      const lineageNames: string[] = [];
      const visitedCodes = new Set<string>();
      let currentCode = row.org_code;

      while (currentCode && !visitedCodes.has(currentCode)) {
        visitedCodes.add(currentCode);
        const currentOrganization = organizationByCode.get(currentCode);

        if (!currentOrganization) {
          break;
        }

        if (currentOrganization.org_code === row.org_division_code) {
          break;
        }

        lineageNames.push(currentOrganization.org_name);
        currentCode = currentOrganization.upper_org_code;
      }

      accumulator[row.org_code] = lineageNames.reverse().join(' > ');
      return accumulator;
    }, {});
  }, [allOrganizations]);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setError(null);

    const loadOrganizations = async () => {
      try {
        const response = await organizationService.getOrganizations(activeUser, queryState);

        if (requestIdRef.current !== requestId) {
          return;
        }

        setRows(response.items);
        setTotal(response.total);
      } catch (loadError) {
        if (requestIdRef.current !== requestId) {
          return;
        }

        setRows([]);
        setTotal(0);
        setError(loadError instanceof Error ? loadError.message : 'Failed to load organizations.');
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    };

    void loadOrganizations();
  }, [activeUser, queryState, repositoryVersion]);

  const resetPagination = useCallback(() => {
    setPage(0);
  }, []);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchInput(event.target.value);
      resetPagination();
    },
    [resetPagination]
  );

  const handleDivisionChange = useCallback(
    (nextValue: string) => {
      if (!canSeeAllDivisions(activeUser)) {
        return;
      }

      setDivisionCode(nextValue);
      resetPagination();
    },
    [activeUser, resetPagination]
  );

  const handleCategoryChange = useCallback(
    (nextValue: string) => {
      setCategoryCode(nextValue);
      resetPagination();
    },
    [resetPagination]
  );

  const handlePaginationChange = useCallback((nextPage: number, nextPageSize: number) => {
    setPage(nextPage);
    setPageSize(nextPageSize);
  }, []);

  const handleSortChange = useCallback((field: OrganizationSortField, direction: OrganizationSortDirection) => {
    setSortField(field);
    setSortDirection(direction);
    setPage(0);
  }, []);

  const handleSelectionChange = useCallback((nextSelection: string[]) => {
    setSelectedRowIds(nextSelection);
  }, []);

  const clearUploadPreview = useCallback(() => {
    setUploadSummary(null);
    setUploadErrors([]);
    setSelectedRowIds([]);
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadErrors([]);
      setError(null);
      setUploadSummary(null);

      try {
        const result = await excelService.validateUpload(file, activeUser);

        setUploadErrors(result.errors);
        setIsUploadDialogOpen(result.errors.length > 0);

        if (result.errors.length > 0) {
          setUploadSummary(`Upload failed. Review ${result.errors.length} validation issue(s).`);
          return;
        }

        if (activeUser.role === 'DIVISION_HR') {
          const changedRows = approvalService.buildChangeRows(activeUser, result.validRows);

          if (changedRows.length === 0) {
            setUploadSummary('No data changes were detected in this upload.');
            return;
          }

          approvalService.submitRequest(activeUser, changedRows);
          setUploadSummary(`Submitted ${changedRows.length} change(s) for approval.`);
        } else {
          const appliedCount = await organizationService.applyOrganizationUpdates(activeUser, result.validRows);
          setUploadSummary(`Applied ${appliedCount} row update(s) to the mock dataset.`);
        }

        setPage(0);
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'Upload processing failed.');
      } finally {
        setIsUploading(false);
      }
    },
    [activeUser]
  );

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setError(null);

    try {
      const exportRows = await organizationService.getOrganizationsForExport(activeUser, queryState);
      excelService.exportOrganizations(exportRows);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : 'Excel export failed.');
    } finally {
      setIsExporting(false);
    }
  }, [activeUser, queryState]);

  return {
    activeUser,
    uiState: {
      searchInput,
      divisionCode: canSeeAllDivisions(activeUser) ? divisionCode : getDivisionNameByCode(activeUser.divisionCode) ?? '',
      categoryCode,
      error,
      isUploadDialogOpen,
      uploadErrors,
      uploadSummary,
      hasUploadedPreview: false,
      isDivisionLocked: !canSeeAllDivisions(activeUser)
    },
    apiState: {
      isLoading,
      isUploading,
      isExporting,
      categories,
      divisions
    },
    tableState: {
      rows,
      total,
      page,
      pageSize,
      sortField,
      sortDirection,
      selectedRowIds,
      departmentHierarchyByCode
    },
    actions: {
      setIsUploadDialogOpen,
      handleSearchChange,
      handleDivisionChange,
      handleCategoryChange,
      handlePaginationChange,
      handleSortChange,
      handleSelectionChange,
      handleUpload,
      handleExport,
      clearUploadPreview
    }
  };
};
