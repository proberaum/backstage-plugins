import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

/**
 * @public
 */
export const envViewerPlugin = createPlugin({
  id: 'env-viewer',
  routes: {
    root: rootRouteRef,
  },
});

/**
 * @public
 */
export const EnvViewerPage = envViewerPlugin.provide(
  createRoutableExtension({
    name: 'EnvViewerPage',
    component: () =>
      import('./components/EnvViewerPage').then(m => m.EnvViewerPage),
    mountPoint: rootRouteRef,
  }),
);
