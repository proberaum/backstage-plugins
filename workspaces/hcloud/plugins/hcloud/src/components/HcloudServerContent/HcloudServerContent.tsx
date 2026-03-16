// plugins/hcloud/src/components/HcloudServerContent/HcloudServerContent.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { HCLOUD_PROJECT_ANNOTATION } from '@proberaum/backstage-plugin-hcloud-common';
import { useServerDetails } from '../../hooks';
import { ServerHeader } from './ServerHeader';
import { ServerInfoCards } from './ServerInfoCards';
import { MetricsPanel } from './MetricsPanel';
import { VolumesTable } from './VolumesTable';
import { LabelsProtection } from './LabelsProtection';

const AUTO_REFRESH_INTERVAL = 30_000;

const useStyles = makeStyles(theme => ({
  section: {
    marginTop: theme.spacing(2),
  },
}));

export function HcloudServerContent() {
  const classes = useStyles();
  const { entity } = useEntity();
  const { server, loading, error, refresh } = useServerDetails();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const project =
    entity.metadata.annotations?.[HCLOUD_PROJECT_ANNOTATION];

  const triggerRefresh = useCallback(() => {
    refresh();
    setRefreshKey(k => k + 1);
  }, [refresh]);

  // Auto-refresh with visibility API
  const setupInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        if (!document.hidden) {
          triggerRefresh();
        }
      }, AUTO_REFRESH_INTERVAL);
    }
  }, [autoRefresh, triggerRefresh]);

  useEffect(() => {
    setupInterval();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [setupInterval]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (!server) {
    return null;
  }

  return (
    <Box>
      <ServerHeader
        server={server}
        project={project}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh(prev => !prev)}
        onRefresh={triggerRefresh}
      />
      <ServerInfoCards server={server} />
      <Box className={classes.section}>
        <MetricsPanel refreshKey={refreshKey} />
      </Box>
      <Box className={classes.section}>
        <VolumesTable volumes={server.volumes} />
      </Box>
      <Box className={classes.section}>
        <LabelsProtection server={server} />
      </Box>
    </Box>
  );
}
