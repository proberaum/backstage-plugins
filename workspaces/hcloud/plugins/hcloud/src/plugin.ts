import {
  createApiFactory,
  createPlugin,
  createComponentExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { hcloudApiRef, HcloudApiClient } from './api';

/**
 * @public
 */
export const hcloudPlugin = createPlugin({
  id: 'hcloud',
  apis: [
    createApiFactory({
      api: hcloudApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new HcloudApiClient({ discoveryApi, fetchApi }),
    }),
  ],
});

/**
 * @public
 */
export const EntityHcloudServerCard = hcloudPlugin.provide(
  createComponentExtension({
    name: 'EntityHcloudServerCard',
    component: {
      lazy: () =>
        import('./components/HcloudServerCard').then(m => m.HcloudServerCard),
    },
  }),
);

/**
 * @public
 */
export const EntityHcloudServerContent = hcloudPlugin.provide(
  createComponentExtension({
    name: 'EntityHcloudServerContent',
    component: {
      lazy: () =>
        import('./components/HcloudServerContent').then(
          m => m.HcloudServerContent,
        ),
    },
  }),
);
