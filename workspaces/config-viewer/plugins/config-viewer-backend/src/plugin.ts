import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';

import type { ConfigViewerConfig } from '../config';
import { createRouter } from './router';

/**
 * configViewerPlugin backend plugin
 *
 * @public
 */
export const configViewerPlugin = createBackendPlugin({
  pluginId: 'config-viewer',
  register(env) {
    env.registerInit({
      deps: {
        rootConfig: coreServices.rootConfig,
        logger: coreServices.logger,
        // httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
      },
      async init({ rootConfig, /*httpAuth,*/ httpRouter }) {
        const config =
          rootConfig.getOptional<ConfigViewerConfig>('configViewer');

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
