import { OrganizationSearchBar } from '@components/OrganizationSearchBar';
import { OrganizationTable } from '@components/OrganizationTable';
import {
  OrganizationSelectionProvider,
  useOrganizationSelection
} from '@contexts/OrganizationSelectionContext';
import { useAppTranslation } from '@hooks/useAppTranslation';
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
  const { t } = useAppTranslation();

  return (
    <Stack spacing={3}>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-4 shadow-sm">
          <Typography variant="body2" className="text-ink-muted">
            {t('organization.summary.currentCount')}
          </Typography>
          <Typography variant="h4">{tableState.total.toLocaleString()}</Typography>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-4 shadow-sm">
          <Typography variant="body2" className="text-ink-muted">
            {t('organization.summary.selectedCount')}
          </Typography>
          <Typography variant="h4">{tableState.selectedRowIds.length.toLocaleString()}</Typography>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-4 shadow-sm">
          <Typography variant="body2" className="text-ink-muted">
            {t('organization.summary.dataSource')}
          </Typography>
          <Typography variant="h4">
            {uiState.hasUploadedPreview
              ? t('organization.summary.uploadPreview')
              : t('organization.summary.organizationApi')}
          </Typography>
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
        isDivisionLocked={uiState.isDivisionLocked}
        onSearchChange={actions.handleSearchChange}
        onDivisionChange={actions.handleDivisionChange}
        onCategoryChange={actions.handleCategoryChange}
        onUpload={actions.handleUpload}
        onDownload={actions.handleExport}
        onClearUploadPreview={actions.clearUploadPreview}
      />

      <OrganizationTable
        rows={tableState.rows}
        departmentHierarchyByCode={tableState.departmentHierarchyByCode}
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
        <DialogTitle>{t('organization.upload.dialogTitle')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="warning">
              {t('organization.upload.dialogMessage', {
                count: uiState.uploadErrors.length.toLocaleString()
              })}
            </Alert>
            <TableContainer className="rounded-lg border border-line">
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('organization.upload.errorRow')}</TableCell>
                    <TableCell>{t('organization.upload.errorColumn')}</TableCell>
                    <TableCell>{t('organization.upload.errorMessage')}</TableCell>
                    <TableCell>{t('organization.upload.errorValue')}</TableCell>
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
