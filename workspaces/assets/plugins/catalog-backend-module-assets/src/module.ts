import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';

export const catalogModuleAssets = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'assets',
  register(reg) {
    reg.registerInit({
      deps: { logger: coreServices.logger },
      async init({ logger }) {
        logger.info('Hello World!');
      },
    });
  },
});
