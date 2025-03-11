import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

/**
 * @public
 */
export const assetsPlugin = createPlugin({
  id: 'assets',
  routes: {
    root: rootRouteRef,
  },
});

/**
 * @public
 */
export const AssetsPage = assetsPlugin.provide(
  createRoutableExtension({
    name: 'AssetsPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
