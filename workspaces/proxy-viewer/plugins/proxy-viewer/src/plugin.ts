import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

/**
 * @public
 */
export const proxyViewerPlugin = createPlugin({
  id: 'proxy-viewer',
  routes: {
    root: rootRouteRef,
  },
});

/**
 * @public
 */
export const ProxyViewerPage = proxyViewerPlugin.provide(
  createRoutableExtension({
    name: 'ProxyViewerPage',
    component: () =>
      import('./components/ProxyViewerPage').then(m => m.ProxyViewerPage),
    mountPoint: rootRouteRef,
  }),
);
