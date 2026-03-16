// plugins/hcloud/src/components/HcloudServerContent/LabelsProtection.tsx
import { Box, Chip, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { InfoCard } from '@backstage/core-components';
import { HcloudServerDetails } from '@proberaum/backstage-plugin-hcloud-common';

const useStyles = makeStyles(theme => ({
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
  },
  protectionLine: {
    fontSize: '0.85rem',
  },
  enabled: {
    color: '#4caf50',
  },
  disabled: {
    color: theme.palette.text.secondary,
  },
}));

function ProtectionStatus({
  label,
  enabled,
}: {
  label: string;
  enabled: boolean;
}) {
  const classes = useStyles();
  return (
    <Typography className={classes.protectionLine}>
      {label}:{' '}
      <span className={enabled ? classes.enabled : classes.disabled}>
        {enabled ? 'enabled' : 'disabled'}
      </span>
    </Typography>
  );
}

export function LabelsProtection({ server }: { server: HcloudServerDetails }) {
  const classes = useStyles();
  const labelEntries = Object.entries(server.labels);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <InfoCard title="Labels" variant="gridItem">
          {labelEntries.length > 0 ? (
            <Box className={classes.chipContainer}>
              {labelEntries.map(([k, v]) => (
                <Chip
                  key={k}
                  label={`${k}=${v}`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No labels
            </Typography>
          )}
        </InfoCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <InfoCard title="Protection & Backups" variant="gridItem">
          <ProtectionStatus
            label="Delete protection"
            enabled={server.protection.delete}
          />
          <ProtectionStatus
            label="Rebuild protection"
            enabled={server.protection.rebuild}
          />
          <ProtectionStatus
            label="Backups"
            enabled={server.backup_window !== null}
          />
          {server.backup_window && (
            <Typography variant="body2" color="textSecondary">
              Backup window: {server.backup_window}
            </Typography>
          )}
        </InfoCard>
      </Grid>
    </Grid>
  );
}
