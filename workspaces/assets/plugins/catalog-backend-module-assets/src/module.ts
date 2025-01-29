import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';

import { AssetsItemCatalogProcessor } from './processors/AssetsItemCatalogProcessor';
import { AssetsLocationCatalogProcessor } from './processors/AssetsLocationCatalogProcessor';


/**
 * A catalog plugin that adds support for assets items and locations.
 * The kinds for both types are configable.
 */
export const catalogModuleAssets = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'assets',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        rootConfig: coreServices.rootConfig,
        catalog: catalogProcessingExtensionPoint,
      },
      async init({ logger, rootConfig, catalog }) {
        const config = rootConfig.getOptionalConfig(
          'catalog.provider.assets',
        );

        logger.info('Enable catalog assets extension!');
        catalog.addProcessor(new AssetsItemCatalogProcessor({ config }));
        catalog.addProcessor(new AssetsLocationCatalogProcessor({ config }));
      },
    });
  },
});
