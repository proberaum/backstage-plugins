import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';

import { AssetsItemCatalogProcessor } from './processors/AssetsItemCatalogProcessor';
import { AssetsPlaceCatalogProcessor } from './processors/AssetsPlaceCatalogProcessor';

export const catalogModuleAssets = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'assets',
  register(reg) {
    reg.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        logger: coreServices.logger,
      },
      async init({ catalog, logger }) {
        logger.info('Enable catalog assets extension!');
        catalog.addProcessor(new AssetsItemCatalogProcessor());
        catalog.addProcessor(new AssetsPlaceCatalogProcessor());
      },
    });
  },
});
