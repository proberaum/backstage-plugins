import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

/**
 * @public
 */
export const configViewerPlugin = createPlugin({
  id: 'config-viewer',
  routes: {
    root: rootRouteRef,
  },
});

/**
 * @public
 */
export const ConfigViewerPage = configViewerPlugin.provide(
  createRoutableExtension({
    name: 'ConfigViewerPage',
    component: () =>
      import('./components/ConfigViewerPage').then(m => m.ConfigViewerPage),
    mountPoint: rootRouteRef,
  }),
);
