// plugins/hcloud/src/components/common/StatusBadge.tsx
import { Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { HcloudServerStatus } from '@proberaum/backstage-plugin-hcloud-common';

const useStyles = makeStyles(theme => ({
  running: { backgroundColor: '#2e7d32', color: '#fff' },
  off: { backgroundColor: theme.palette.grey[600], color: '#fff' },
  error: { backgroundColor: theme.palette.error.main, color: '#fff' },
  transitioning: { backgroundColor: theme.palette.warning.main, color: '#fff' },
}));

function statusCategory(
  status: HcloudServerStatus,
): 'running' | 'off' | 'error' | 'transitioning' {
  switch (status) {
    case 'running':
      return 'running';
    case 'off':
      return 'off';
    case 'deleting':
    case 'unknown':
      return 'error';
    default:
      return 'transitioning';
  }
}

export function StatusBadge({ status }: { status: HcloudServerStatus }) {
  const classes = useStyles();
  const category = statusCategory(status);
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return <Chip label={label} size="small" className={classes[category]} />;
}
