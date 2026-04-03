import { OrganizationSearchBar } from '@components/OrganizationSearchBar';
import { OrganizationTable } from '@components/OrganizationTable';
import {
  OrganizationSelectionProvider,
  useOrganizationSelection
} from '@contexts/OrganizationSelectionContext';
import {
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';

const OrganizationSelectionContent = () => {
  const { uiState, apiState, tableState, actions } = useOrganizationSelection();

  return (
    <Stack spacing={3}>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-4 shadow-sm">
          <Typography variant="body2" className="text-ink-muted">
            현재 조회 건수
          </Typography>
          <Typography variant="h4">{tableState.total.toLocaleString()}</Typography>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-4 shadow-sm">
          <Typography variant="body2" className="text-ink-muted">
            선택된 조직
          </Typography>
          <Typography variant="h4">{tableState.selectedRowIds.length.toLocaleString()}</Typography>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-4 shadow-sm">
          <Typography variant="body2" className="text-ink-muted">
            데이터 소스
          </Typography>
          <Typography variant="h4">{uiState.hasUploadedPreview ? '업로드 미리보기' : '조직 API'}</Typography>
        </div>
      </div>

      {uiState.error ? <Alert severity="error">{uiState.error}</Alert> : null}

      <OrganizationSearchBar
        searchValue={uiState.searchInput}
        divisionCode={uiState.divisionCode}
        categoryCode={uiState.categoryCode}
        divisions={apiState.divisions}
        categories={apiState.categories}
        isUploading={apiState.isUploading}
        isExporting={apiState.isExporting}
        uploadSummary={uiState.uploadSummary}
        hasUploadedPreview={uiState.hasUploadedPreview}
        onSearchChange={actions.handleSearchChange}
        onDivisionChange={actions.handleDivisionChange}
        onCategoryChange={actions.handleCategoryChange}
        onUpload={actions.handleUpload}
        onDownload={actions.handleExport}
        onClearUploadPreview={actions.clearUploadPreview}
      />

      <OrganizationTable
        rows={tableState.rows}
        total={tableState.total}
        page={tableState.page}
        pageSize={tableState.pageSize}
        isLoading={apiState.isLoading}
        sortField={tableState.sortField}
        sortDirection={tableState.sortDirection}
        selectionModel={tableState.selectedRowIds}
        onPaginationChange={actions.handlePaginationChange}
        onSortChange={actions.handleSortChange}
        onSelectionChange={actions.handleSelectionChange}
      />

      <Dialog
        open={uiState.isUploadDialogOpen}
        onClose={() => {
          actions.setIsUploadDialogOpen(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>엑셀 검증 오류</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="warning">
              유효한 행만 반영되며, 아래 오류가 있는 행은 제외됩니다. 총 {uiState.uploadErrors.length}건의 오류를
              확인했습니다.
            </Alert>
            <TableContainer className="rounded-lg border border-line">
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>행</TableCell>
                    <TableCell>컬럼</TableCell>
                    <TableCell>오류 내용</TableCell>
                    <TableCell>입력 값</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uiState.uploadErrors.map((error) => (
                    <TableRow key={`${error.rowNumber}-${error.column}-${error.message}`}>
                      <TableCell>{error.rowNumber}</TableCell>
                      <TableCell>{error.column}</TableCell>
                      <TableCell>{error.message}</TableCell>
                      <TableCell>{error.value ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
};

export const OrganizationSelectionPage = () => (
  <OrganizationSelectionProvider>
    <OrganizationSelectionContent />
  </OrganizationSelectionProvider>
);
