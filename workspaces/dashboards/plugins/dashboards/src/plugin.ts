import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { dashboardsApiRef } from './api/DashboardsApi';
import { DashboardsClient } from './api/DashboardsClient';
import { dashboardsRouteRef } from './routes';

/**
 * @public
 */
export const dashboardsPlugin = createPlugin({
  id: 'dashboards',
  apis: [
    createApiFactory({
      api: dashboardsApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
      },
      factory: deps => new DashboardsClient(deps),
    }),
  ],
  routes: {
    dashboardsRouteRef,
  },
});

/**
 * @public
 */
export const DashboardsPage = dashboardsPlugin.provide(
  createRoutableExtension({
    name: 'DashboardsPage',
    component: () =>
      import('./components/DashboardsPage').then(m => m.DashboardsPage),
    mountPoint: dashboardsRouteRef,
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

/**
 * @public
 */
export const DashboardRouter = dashboardsPlugin.provide(
  createRoutableExtension({
    name: 'DashboardsPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: dashboardsRouteRef,
  }),
);
