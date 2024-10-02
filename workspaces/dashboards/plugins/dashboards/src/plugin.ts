import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const dashboardsPlugin = createPlugin({
  id: 'dashboards',
  routes: {
    root: rootRouteRef,
  },
});

export const DashboardsPage = dashboardsPlugin.provide(
  createRoutableExtension({
    name: 'DashboardsPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
