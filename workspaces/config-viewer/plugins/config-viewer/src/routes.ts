import { createRouteRef, createSubRouteRef } from '@backstage/frontend-plugin-api';

export const rootRouteRef = createRouteRef();

export const fileRouteRef = createSubRouteRef({
  parent: rootRouteRef,
  path: '/:file',
});
