// plugins/hcloud/src/components/HcloudServerContent/ServerInfoCards.tsx
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { InfoCard } from '@backstage/core-components';
import { HcloudServerDetails } from '@proberaum/backstage-plugin-hcloud-common';

const useStyles = makeStyles(theme => ({
  label: {
    color: theme.palette.text.secondary,
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    marginBottom: theme.spacing(0.5),
  },
  primary: {
    fontSize: '0.95rem',
    fontWeight: 500,
  },
  secondary: {
    color: theme.palette.text.secondary,
    fontSize: '0.8rem',
  },
}));

export function ServerInfoCards({ server }: { server: HcloudServerDetails }) {
  const classes = useStyles();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <InfoCard title="Server Type" variant="gridItem">
          <Typography className={classes.primary}>
            {server.server_type.name.toUpperCase()}
          </Typography>
          <Typography className={classes.secondary}>
            {server.server_type.cores} vCPU · {server.server_type.memory} GB RAM
            · {server.server_type.disk} GB disk
          </Typography>
        </InfoCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <InfoCard title="Location" variant="gridItem">
          <Typography className={classes.primary}>
            {server.datacenter.name}
          </Typography>
          <Typography className={classes.secondary}>
            {server.datacenter.location.city},{' '}
            {server.datacenter.location.country}
          </Typography>
        </InfoCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <InfoCard title="Image" variant="gridItem">
          <Typography className={classes.primary}>
            {server.image?.description ?? 'None'}
          </Typography>
          <Typography className={classes.secondary}>
            {server.image
              ? `Created: ${new Date(
                  server.image.created,
                ).toLocaleDateString()}`
              : ''}
          </Typography>
        </InfoCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <InfoCard title="Networking" variant="gridItem">
          <Typography className={classes.primary}>
            {server.public_net.ipv4.ip}
          </Typography>
          <Typography className={classes.secondary}>
            IPv6:{' '}
            {server.public_net.ipv6.ip
              ? server.public_net.ipv6.ip.substring(0, 20) + '...'
              : 'None'}
          </Typography>
        </InfoCard>
      </Grid>
    </Grid>
  );
}
