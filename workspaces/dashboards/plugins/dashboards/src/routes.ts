import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const dashboardsRouteRef = createRouteRef({
  id: 'dashboards',
});

export const dashboardDetailRouteRef = createSubRouteRef({
  id: 'dashboards/detail',
  parent: dashboardsRouteRef,
  path: '/:name/*',
});
