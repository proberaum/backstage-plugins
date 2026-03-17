// plugins/hcloud/src/components/HcloudServerContent/MetricsChart.tsx
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { HcloudTimeSeries } from '@proberaum/backstage-plugin-hcloud-common';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1.5),
  },
  title: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
}));

const COLORS = [
  '#4caf50',
  '#f44336',
  '#2196f3',
  '#ff9800',
  '#9c27b0',
  '#00bcd4',
];

export function MetricsChart(props: {
  title: string;
  timeSeries: HcloudTimeSeries[];
  loading?: boolean;
}) {
  const classes = useStyles();
  const { title, timeSeries, loading } = props;

  if (loading || timeSeries.length === 0) {
    return (
      <Box className={classes.root}>
        <Typography className={classes.title}>{title}</Typography>
        <Typography variant="body2" color="textSecondary">
          {loading ? 'Loading...' : 'No data'}
        </Typography>
      </Box>
    );
  }

  // Merge all series into a single data array keyed by timestamp
  const dataMap = new Map<number, Record<string, number>>();
  for (const series of timeSeries) {
    for (const { timestamp, value } of series.values) {
      const existing = dataMap.get(timestamp) ?? { timestamp };
      existing[series.name] = value;
      dataMap.set(timestamp, existing);
    }
  }
  const data = Array.from(dataMap.values()).sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  return (
    <Box className={classes.root}>
      <Typography className={classes.title}>{title}</Typography>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data}>
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={ts =>
              new Date(ts * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            }
            tick={{ fontSize: 10 }}
          />
          <YAxis tick={{ fontSize: 10 }} width={40} />
          <Tooltip
            labelFormatter={ts =>
              new Date((ts as number) * 1000).toLocaleString()
            }
          />
          {timeSeries.map((series, i) => (
            <Line
              key={series.name}
              type="monotone"
              dataKey={series.name}
              stroke={COLORS[i % COLORS.length]}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
