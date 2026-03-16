import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { hcloudServiceRef } from './service';

export const hcloudPlugin = createBackendPlugin({
  pluginId: 'hcloud',
  register(env) {
    env.registerInit({
      deps: {
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        hcloudService: hcloudServiceRef,
      },
      async init({ httpAuth, httpRouter, hcloudService }) {
        const router = await createRouter({
          httpAuth,
          hcloudService,
        });
        httpRouter.use(router as any);
      },
    });
  },
});
