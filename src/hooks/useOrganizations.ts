import { excelService } from '@services/excelService';
import { organizationService, sortOrganizations } from '@services/organizationService';
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

const FULL_DATA_QUERY: OrganizationQueryState = {
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
};

const filterUploadedRows = (rows: OrganizationRecord[], query: OrganizationQueryState) =>
  rows.filter((row) => {
    if (query.filters.divisionCode && row.org_division_name !== query.filters.divisionCode) {
      return false;
    }

    if (query.filters.categoryCode && row.org_category_code !== query.filters.categoryCode) {
      return false;
    }

    if (!query.filters.search) {
      return true;
    }

    const keyword = query.filters.search.toLowerCase();

    return [row.org_name, row.org_code, row.org_division_name, row.org_category_name].some((value) =>
      value.toLowerCase().includes(keyword)
    );
  });

export const useOrganizations = () => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [divisionCode, setDivisionCode] = useState('');
  const [categoryCode, setCategoryCode] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortField, setSortField] = useState<OrganizationSortField>('updated_date');
  const [sortDirection, setSortDirection] = useState<OrganizationSortDirection>('desc');
  const [rows, setRows] = useState<OrganizationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [uploadedRows, setUploadedRows] = useState<OrganizationRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<OrganizationUploadValidationError[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadSummary, setUploadSummary] = useState<string | null>(null);
  const [categories, setCategories] = useState<OrganizationCategorySummary[]>([]);
  const [divisions, setDivisions] = useState<OrganizationDivisionSummary[]>([]);
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
    let isMounted = true;

    const loadOptions = async () => {
      try {
        const [categoryOptions, divisionOptions] = await Promise.all([
          organizationService.getOrganizationCategories(),
          organizationService.getOrganizationDivisions()
        ]);

        if (!isMounted) {
          return;
        }

        setCategories(categoryOptions);
        setDivisions(divisionOptions);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : '필터 옵션을 불러오지 못했습니다.');
      }
    };

    void loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const queryState = useMemo<OrganizationQueryState>(
    () => ({
      filters: {
        search: debouncedSearch,
        divisionCode,
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
    [categoryCode, debouncedSearch, divisionCode, page, pageSize, sortDirection, sortField]
  );

  const uploadedResult = useMemo(() => {
    if (!uploadedRows) {
      return null;
    }

    const filteredRows = filterUploadedRows(uploadedRows, queryState);
    const sortedRows = sortOrganizations(filteredRows, queryState.sort);
    const offset = page * pageSize;

    return {
      items: sortedRows.slice(offset, offset + pageSize),
      total: sortedRows.length
    };
  }, [page, pageSize, queryState, uploadedRows]);

  useEffect(() => {
    if (uploadedResult) {
      setRows(uploadedResult.items);
      setTotal(uploadedResult.total);
      setIsLoading(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setError(null);

    const loadOrganizations = async () => {
      try {
        const response = await organizationService.getOrganizations(queryState);

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
        setError(loadError instanceof Error ? loadError.message : '조직 목록을 불러오지 못했습니다.');
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    };

    void loadOrganizations();
  }, [queryState, uploadedResult]);

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
      setDivisionCode(nextValue);
      resetPagination();
    },
    [resetPagination]
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
    setUploadedRows(null);
    setUploadSummary(null);
    setUploadErrors([]);
    setSelectedRowIds([]);
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadErrors([]);
    setError(null);

    try {
      const result = await excelService.validateUpload(file);

      setUploadErrors(result.errors);
      setIsUploadDialogOpen(result.errors.length > 0);

      if (result.errors.length > 0) {
        setUploadSummary(`업로드에 실패했습니다. 총 ${result.errors.length}건의 오류를 확인해 주세요.`);
        return;
      }

      const baseRows = uploadedRows ?? (await organizationService.getOrganizationsForExport(FULL_DATA_QUERY));
      const updatesByCode = new Map(result.validRows.map((row) => [row.org_code, row]));
      const mergedRows = baseRows.map((row) => updatesByCode.get(row.org_code) ?? row);

      setUploadedRows(mergedRows);
      setUploadSummary(`${baseRows.length.toLocaleString()}건 중 ${result.validRows.length}건이 업데이트되었습니다.`);
      setPage(0);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : '엑셀 업로드 처리 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  }, [uploadedRows]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setError(null);

    try {
      const exportRows = uploadedRows
        ? sortOrganizations(filterUploadedRows(uploadedRows, queryState), queryState.sort)
        : await organizationService.getOrganizationsForExport(queryState);

      excelService.exportOrganizations(exportRows);
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : '엑셀 다운로드 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  }, [queryState, uploadedRows]);

  return {
    uiState: {
      searchInput,
      divisionCode,
      categoryCode,
      error,
      isUploadDialogOpen,
      uploadErrors,
      uploadSummary,
      hasUploadedPreview: Boolean(uploadedRows)
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
      selectedRowIds
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
