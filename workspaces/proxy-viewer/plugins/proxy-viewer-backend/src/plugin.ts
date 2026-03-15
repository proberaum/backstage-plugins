import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';

import { createRouter } from './router';

/**
 * proxyViewerPlugin backend plugin
 *
 * @public
 */
export const proxyViewerPlugin = createBackendPlugin({
  pluginId: 'proxy-viewer',
  register(env) {
    env.registerInit({
      deps: {
        rootConfig: coreServices.rootConfig,
        // httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
      },
      async init({ rootConfig, httpRouter }) {
        httpRouter.use(
          await createRouter({
            rootConfig,
          }),
        );
      },
    });
  },
});
