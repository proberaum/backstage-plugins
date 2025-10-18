import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

/**
 * @public
 */
export const iconViewerPlugin = createPlugin({
  id: 'icon-viewer',
  routes: {
    root: rootRouteRef,
  },
});

/**
 * @public
 */
export const IconViewerPage = iconViewerPlugin.provide(
  createRoutableExtension({
    name: 'IconViewerPage',
    component: () =>
      import('./components/IconViewerPage').then(m => m.IconViewerPage),
    mountPoint: rootRouteRef,
  }),
);
