import {
  createPlugin,
  createRoutableExtension,
  createRouteRef,
} from '@backstage/core-plugin-api';

const rootRouteRef = createRouteRef({
  id: 'config-viewer-legacy',
});

/**
 * @public
 */
export const configViewerPlugin = createPlugin({
  id: 'config-viewer-legacy',
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
