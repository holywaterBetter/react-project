import { useDevUserMode } from '@features/auth/context/DevUserModeContext';
import { Chip, MenuItem, Select, Stack, Typography } from '@mui/material';

export const DevUserModeSwitcher = () => {
  const { activeUser, availableModes, setActiveModeId } = useDevUserMode();

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip
        size="small"
        color={activeUser.role === 'DIVISION_HR' ? 'secondary' : 'primary'}
        label={activeUser.divisionName ? `${activeUser.role} · ${activeUser.divisionName}` : activeUser.role}
      />
      <Select
        size="small"
        value={activeUser.id}
        onChange={(event) => {
          setActiveModeId(event.target.value);
        }}
        sx={{
          minWidth: 240,
          backgroundColor: 'var(--color-bg-surface)'
        }}
      >
        {availableModes.map((mode) => (
          <MenuItem key={mode.id} value={mode.id}>
            <Stack spacing={0.25}>
              <Typography variant="body2" fontWeight={600}>
                {mode.role}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {mode.divisionName ?? 'All divisions'}
              </Typography>
            </Stack>
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
};
