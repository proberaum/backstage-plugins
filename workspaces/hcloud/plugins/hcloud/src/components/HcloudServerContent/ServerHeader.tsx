// plugins/hcloud/src/components/HcloudServerContent/ServerHeader.tsx
import { Box, Button, Typography, FormControlLabel, Switch } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import { HcloudServerDetails } from '@proberaum/backstage-plugin-hcloud-common';
import { StatusBadge } from '../common';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  meta: {
    color: theme.palette.text.secondary,
    fontSize: '0.8rem',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));

export function ServerHeader(props: {
  server: HcloudServerDetails;
  project: string | undefined;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
}) {
  const classes = useStyles();
  const { server, project, autoRefresh, onToggleAutoRefresh, onRefresh } = props;

  return (
    <Box className={classes.root}>
      <Box className={classes.left}>
        <Typography variant="h5">{server.name}</Typography>
        <StatusBadge status={server.status} />
        <Typography className={classes.meta}>
          ID: {server.id}{project ? ` · Project: ${project}` : ''}
        </Typography>
      </Box>
      <Box className={classes.right}>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={autoRefresh}
              onChange={onToggleAutoRefresh}
            />
          }
          label="Auto-refresh"
        />
        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
        >
          Refresh
        </Button>
      </Box>
    </Box>
  );
}
