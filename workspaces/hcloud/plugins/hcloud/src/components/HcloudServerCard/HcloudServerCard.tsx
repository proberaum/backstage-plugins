// plugins/hcloud/src/components/HcloudServerCard/HcloudServerCard.tsx
import {
  Grid,
  LinearProgress,
  Typography,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { InfoCard, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useServerDetails } from '../../hooks';
import { useServerMetrics } from '../../hooks';
import { StatusBadge } from '../common';

const useStyles = makeStyles(theme => ({
  label: {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
  },
  value: {
    fontSize: '0.875rem',
  },
  barContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  bar: {
    flexGrow: 1,
    height: 6,
    borderRadius: 3,
  },
  barLabel: {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
    minWidth: 32,
  },
}));

function CpuBar({ value }: { value: number }) {
  const classes = useStyles();
  return (
    <Box>
      <Typography className={classes.label}>CPU</Typography>
      <Box className={classes.barContainer}>
        <LinearProgress
          variant="determinate"
          value={Math.min(value, 100)}
          className={classes.bar}
          style={{ backgroundColor: '#4caf5033' }}
        />
        <Typography className={classes.barLabel}>{Math.round(value)}%</Typography>
      </Box>
    </Box>
  );
}

export function HcloudServerCard() {
  const classes = useStyles();
  const { server, loading, error } = useServerDetails();
  const { metrics: cpuMetrics } = useServerMetrics('cpu', '1h');

  if (loading) {
    return <InfoCard title="Hetzner Cloud Server"><Progress /></InfoCard>;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (!server) {
    return null;
  }

  // CPU metrics from hcloud are 0-100 percentage
  const latestCpu = cpuMetrics?.timeSeries?.[0]?.values?.at(-1)?.value ?? 0;

  return (
    <InfoCard
      title="Hetzner Cloud Server"
      subheader={<StatusBadge status={server.status} />}
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography className={classes.label}>Server</Typography>
          <Typography className={classes.value}>{server.name}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={classes.label}>Type</Typography>
          <Typography className={classes.value}>
            {server.server_type.name.toUpperCase()} ({server.server_type.cores} vCPU / {server.server_type.memory} GB)
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={classes.label}>Datacenter</Typography>
          <Typography className={classes.value}>{server.datacenter.name}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={classes.label}>IPv4</Typography>
          <Typography className={classes.value}>{server.public_net.ipv4.ip}</Typography>
        </Grid>
        <Grid item xs={12}>
          <CpuBar value={latestCpu} />
        </Grid>
      </Grid>
    </InfoCard>
  );
}
