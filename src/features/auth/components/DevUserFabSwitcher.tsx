import { useDevUserMode } from '@features/auth/context/DevUserModeContext';
import { getDivisionNameByCode } from '@features/auth/types/devUserMode';
import { useAppTranslation } from '@hooks/useAppTranslation';
import { AccountCircleRounded, ExpandLessRounded, ExpandMoreRounded } from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useCallback, useMemo, useState, type MouseEvent } from 'react';

export const DevUserFabSwitcher = () => {
  const { t, i18n } = useAppTranslation();
  const { activeUser, availableModes, isLoadingUsers, setActiveModeEmpNo } = useDevUserMode();
  const theme = useTheme();
  const isMobileViewport = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorEl);

  const activeLabel = useMemo(() => {
    const name = i18n.language === 'ko' ? activeUser.name : activeUser.nameEn;
    const division = getDivisionNameByCode(activeUser.divisionCode);

    if (activeUser.role !== 'DIVISION_HR' || !division) {
      return `${name} | ${activeUser.role}`;
    }

    return `${name} | ${division}`;
  }, [activeUser.divisionCode, activeUser.name, activeUser.nameEn, activeUser.role, i18n.language]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleToggle = useCallback((event: MouseEvent<HTMLElement>) => {
    setAnchorEl((current) => (current ? null : event.currentTarget));
  }, []);

  const handleModeSelect = useCallback(
    async (empNo: number) => {
      await setActiveModeEmpNo(empNo);
      handleClose();
    },
    [handleClose, setActiveModeEmpNo]
  );

  const listContent = (
    <List
      disablePadding
      sx={{
        width: '100%',
        minWidth: { sm: 320 },
        maxHeight: { xs: 'min(70vh, 440px)', sm: 'min(60vh, 420px)' },
        overflowY: 'auto',
        p: 1
      }}
    >
      {availableModes.map((mode) => {
        const isActive = mode.empNo === activeUser.empNo;
        const divisionName = getDivisionNameByCode(mode.divisionCode);
        const userName = i18n.language === 'ko' ? mode.name : mode.nameEn;
        const secondaryLabel =
          mode.role === 'DIVISION_HR' && divisionName ? `${mode.role} | ${divisionName}` : mode.role;

        return (
          <ListItemButton
            key={mode.empNo}
            selected={isActive}
            onClick={() => {
              void handleModeSelect(mode.empNo);
            }}
            sx={{
              mb: 0.5,
              borderRadius: 2,
              alignItems: 'flex-start',
              border: '1px solid',
              borderColor: isActive ? 'primary.main' : 'divider',
              backgroundColor: isActive ? 'primary.50' : 'background.paper'
            }}
          >
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={700}>
                  {userName}
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {secondaryLabel}
                </Typography>
              }
            />
          </ListItemButton>
        );
      })}
    </List>
  );

  return (
    <Box sx={{ position: 'fixed', right: 20, bottom: 20, zIndex: (themeValue) => themeValue.zIndex.fab }}>
      <Fab
        color="primary"
        variant="extended"
        disabled={isLoadingUsers}
        onClick={handleToggle}
        aria-label="dev-user-switcher"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <AccountCircleRounded sx={{ mr: 1 }} />
        {isLoadingUsers ? t('userSelector.loading') : activeLabel}
        {isOpen ? <ExpandMoreRounded sx={{ ml: 0.5 }} /> : <ExpandLessRounded sx={{ ml: 0.5 }} />}
      </Fab>

      {isMobileViewport ? (
        <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="xs">
          <DialogTitle sx={{ pb: 1 }}>{activeLabel}</DialogTitle>
          <DialogContent dividers sx={{ p: 0 }}>
            {listContent}
          </DialogContent>
        </Dialog>
      ) : (
        <Popover
          open={isOpen}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                mb: 1.5,
                width: 360,
                maxWidth: 'calc(100vw - 32px)',
                borderRadius: 3,
                overflow: 'hidden'
              }
            }
          }}
        >
          {listContent}
        </Popover>
      )}
    </Box>
  );
};
