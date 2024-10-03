import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/**
 * dashboardsPlugin backend plugin
 *
 * @public
 */
export const dashboardsPlugin = createBackendPlugin({
  pluginId: 'dashboards',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        httpAuth: coreServices.httpAuth,
        userInfo: coreServices.userInfo,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        database: coreServices.database,
      },
      async init({
        httpRouter,
        httpAuth,
        userInfo,
        logger,
        config,
        database,
      }) {
        httpRouter.use(
          await createRouter({
            httpAuth,
            userInfo,
            config,
            logger,
          }),
        );
        httpRouter.addAuthPolicy({
          path: '/health',
          allow: 'unauthenticated',
        });
      },
    });
  },
});
