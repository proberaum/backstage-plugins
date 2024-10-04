import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const dashboardsListRouteRef = createRouteRef({
  id: 'dashboards',
});

export const dashboardDetailRouteRef = createSubRouteRef({
  id: 'dashboards/detail',
  parent: dashboardsListRouteRef,
  path: '/:name',
});
