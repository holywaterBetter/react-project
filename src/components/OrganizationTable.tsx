import { Box, Chip, Stack, Typography } from '@mui/material';
import { DataGrid, type GridColDef, type GridPaginationModel, type GridRowSelectionModel, type GridSortModel } from '@mui/x-data-grid';
import type { OrganizationRecord, OrganizationSortDirection, OrganizationSortField } from '@shared-types/org';
import { useMemo } from 'react';

type OrganizationTableProps = {
  rows: OrganizationRecord[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  sortField: OrganizationSortField;
  sortDirection: OrganizationSortDirection;
  selectionModel: string[];
  onPaginationChange: (page: number, pageSize: number) => void;
  onSortChange: (field: OrganizationSortField, direction: OrganizationSortDirection) => void;
  onSelectionChange: (selection: string[]) => void;
};

const formatYearMonth = (value: string) => {
  if (value.length !== 8) {
    return value;
  }

  return `${value.slice(0, 4)}.${value.slice(4, 6)}`;
};

const EmptyOverlay = () => (
  <div className="flex h-full min-h-56 items-center justify-center">
    <Stack spacing={1} className="items-center text-center">
      <Typography variant="h6">조회된 조직이 없습니다.</Typography>
      <Typography variant="body2" className="max-w-md text-ink-muted">
        검색어 또는 필터 조건을 조정하거나 엑셀 파일을 업로드해 조직 선택 목록을 구성해 보세요.
      </Typography>
    </Stack>
  </div>
);

export const OrganizationTable = ({
  rows,
  total,
  page,
  pageSize,
  isLoading,
  sortField,
  sortDirection,
  selectionModel,
  onPaginationChange,
  onSortChange,
  onSelectionChange
}: OrganizationTableProps) => {
  const columns = useMemo<GridColDef<OrganizationRecord>[]>(
    () => [
      {
        field: 'updated_date',
        headerName: '기준년월',
        minWidth: 130,
        flex: 0.8,
        sortable: true,
        valueFormatter: (_value, row) => formatYearMonth(row.updated_date)
      },
      {
        field: 'org_division_name',
        headerName: '사업부',
        minWidth: 220,
        flex: 1.1,
        sortable: true
      },
      {
        field: 'org_name',
        headerName: '현부서',
        minWidth: 260,
        flex: 1.4,
        sortable: false,
        renderCell: (params) => (
          <div className="flex min-w-0 flex-col py-2">
            <Typography variant="body2" className="truncate font-medium text-ink">
              {params.row.org_name}
            </Typography>
            <Typography variant="caption" className="text-ink-muted">
              {params.row.org_code}
            </Typography>
          </div>
        )
      },
      {
        field: 'org_category_name',
        headerName: '조직분류',
        minWidth: 180,
        flex: 0.9,
        sortable: false,
        renderCell: (params) => (
          <Chip size="small" label={params.row.org_category_name} variant="outlined" />
        )
      }
    ],
    []
  );

  const paginationModel = useMemo<GridPaginationModel>(
    () => ({
      page,
      pageSize
    }),
    [page, pageSize]
  );

  const sortModel = useMemo<GridSortModel>(
    () => [
      {
        field: sortField,
        sort: sortDirection
      }
    ],
    [sortDirection, sortField]
  );

  return (
    <Box className="rounded-[var(--radius-xl)] border border-line bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <Typography variant="h6">조직 목록</Typography>
          <Typography variant="body2" className="text-ink-muted">
            총 {total.toLocaleString()}건
          </Typography>
        </div>
      </div>

      <DataGrid
        autoHeight={false}
        rows={rows}
        columns={columns}
        loading={isLoading}
        rowCount={total}
        pageSizeOptions={[10, 25, 50]}
        paginationMode="server"
        sortingMode="server"
        checkboxSelection
        disableRowSelectionOnClick
        paginationModel={paginationModel}
        onPaginationModelChange={(model) => {
          onPaginationChange(model.page, model.pageSize);
        }}
        sortModel={sortModel}
        onSortModelChange={(model) => {
          const [nextSort] = model;

          if (!nextSort?.field || (nextSort.field !== 'updated_date' && nextSort.field !== 'org_division_name')) {
            return;
          }

          onSortChange(nextSort.field, nextSort.sort === 'asc' ? 'asc' : 'desc');
        }}
        rowSelectionModel={{
          type: 'include',
          ids: new Set(selectionModel)
        }}
        onRowSelectionModelChange={(model: GridRowSelectionModel) => {
          onSelectionChange([...model.ids].map(String));
        }}
        getRowId={(row) => row.org_code}
        slots={{
          noRowsOverlay: EmptyOverlay,
          noResultsOverlay: EmptyOverlay
        }}
        sx={{
          border: 'none',
          minHeight: 580,
          '& .MuiDataGrid-columnHeaders': {
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider'
          },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
            outline: 'none'
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      />
    </Box>
  );
};
