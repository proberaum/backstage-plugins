import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { dashboardsListRouteRef, dashboardDetailRouteRef } from './routes';
import { dashboardsApiRef } from './api/DashboardsApi';
import { DashboardsClient } from './api/DashboardsClient';

export const dashboardsPlugin = createPlugin({
  id: 'dashboards',
  apis: [
    createApiFactory({
      api: dashboardsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: (deps) => new DashboardsClient(deps),
    }),
  ],
  routes: {
    dashboardsListRouteRef,
    dashboardDetailRouteRef,
  },
});

export const DashboardsPage = dashboardsPlugin.provide(
  createRoutableExtension({
    name: 'DashboardsPage',
    component: () =>
      import('./components/DashboardsPage').then(m => m.DashboardsPage),
    mountPoint: dashboardsListRouteRef,
  }),
);

// export const DashboardPage = dashboardsPlugin.provide(
//   createRoutableExtension({
//     name: 'DashboardPage',
//     component: () =>
//       import('./components/DashboardPage').then(m => m.DashboardPage),
//     mountPoint: dashboardDetailRouteRef,
//   }),
// );

export const DashboardRouter = dashboardsPlugin.provide(
  createRoutableExtension({
    name: 'DashboardsPage',
    component: () =>
      import('./components/Router').then(m => m.Router),
    mountPoint: dashboardsListRouteRef,
  }),
);
