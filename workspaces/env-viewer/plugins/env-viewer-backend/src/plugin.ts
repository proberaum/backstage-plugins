import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';

import type { EnvViewerConfig } from '../config';

import { createRouter } from './router';

/**
 * envViewerPlugin backend plugin
 *
 * @public
 */
export const envViewerPlugin = createBackendPlugin({
  pluginId: 'env-viewer',
  register(env) {
    env.registerInit({
      deps: {
        rootConfig: coreServices.rootConfig,
        // httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
      },
      async init({ rootConfig, httpRouter }) {
        const config = rootConfig.getOptional<EnvViewerConfig>('envViewer');

        if (!config) {
          return;
        }

        httpRouter.use(
          await createRouter({
            config,
            // httpAuth,
          }),
        );
      },
    });
  },
});
