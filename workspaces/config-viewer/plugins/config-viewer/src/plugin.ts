import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const configViewerPlugin = createPlugin({
  id: 'config-viewer',
  routes: {
    root: rootRouteRef,
  },
});

export const ConfigViewerPage = configViewerPlugin.provide(
  createRoutableExtension({
    name: 'ConfigViewerPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
