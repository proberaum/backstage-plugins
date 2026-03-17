// plugins/hcloud/src/components/HcloudServerContent/MetricsPanel.tsx
import { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { InfoCard } from '@backstage/core-components';
import { HcloudTimeRange } from '@proberaum/backstage-plugin-hcloud-common';
import { useServerMetrics } from '../../hooks';
import { MetricsChart } from './MetricsChart';

const useStyles = makeStyles(theme => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
}));

const TIME_RANGES: HcloudTimeRange[] = ['1h', '6h', '24h', '7d', '30d'];

export function MetricsPanel({ refreshKey }: { refreshKey?: number }) {
  const classes = useStyles();
  const [range, setRange] = useState<HcloudTimeRange>('1h');

  const cpu = useServerMetrics('cpu', range);
  const disk = useServerMetrics('disk', range);
  const network = useServerMetrics('network', range);

  // Re-fetch metrics when refreshKey changes (from auto-refresh or manual refresh)
  useEffect(() => {
    if (refreshKey && refreshKey > 0) {
      cpu.refresh();
      disk.refresh();
      network.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <Box>
      <Box className={classes.header}>
        <Typography variant="h6">Metrics</Typography>
        <ButtonGroup size="small" variant="outlined">
          {TIME_RANGES.map(r => (
            <Button
              key={r}
              onClick={() => setRange(r)}
              variant={r === range ? 'contained' : 'outlined'}
              color={r === range ? 'primary' : 'default'}
            >
              {r}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <InfoCard title="" variant="gridItem">
            <MetricsChart
              title="CPU Usage"
              timeSeries={cpu.metrics?.timeSeries ?? []}
              loading={cpu.loading}
            />
          </InfoCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <InfoCard title="" variant="gridItem">
            <MetricsChart
              title="Disk I/O"
              timeSeries={disk.metrics?.timeSeries ?? []}
              loading={disk.loading}
            />
          </InfoCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <InfoCard title="" variant="gridItem">
            <MetricsChart
              title="Network"
              timeSeries={network.metrics?.timeSeries ?? []}
              loading={network.loading}
            />
          </InfoCard>
        </Grid>
      </Grid>
    </Box>
  );
}
