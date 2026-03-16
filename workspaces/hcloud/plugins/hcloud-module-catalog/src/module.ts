import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import { hcloudServiceRef } from '@proberaum/backstage-plugin-hcloud-backend';
import { HcloudEntityProvider } from './provider';

export const catalogModuleHcloud = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'hcloud',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
        catalog: catalogProcessingExtensionPoint,
        hcloudService: hcloudServiceRef,
      },
      async init({ logger, config, scheduler, catalog, hcloudService }) {
        const provider = new HcloudEntityProvider({
          config,
          hcloudService,
          logger,
          scheduler,
        });
        catalog.addEntityProvider(provider);
        logger.info('Registered hcloud catalog entity provider');
      },
    });
  },
});
