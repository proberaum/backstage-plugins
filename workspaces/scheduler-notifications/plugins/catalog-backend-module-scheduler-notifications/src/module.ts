import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { notificationService } from '@backstage/plugin-notifications-node';

import { SchedulerNotificationCatalogProcessor } from './processor/SchedulerNotificationCatalogProcessor';

export const catalogModuleSchedulerNotifications = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'scheduler-notifications',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        auth: coreServices.auth,
        catalog: catalogServiceRef,
        catalogProcessingExtensionPoint,
        scheduler: coreServices.scheduler,
        notificationService: notificationService,
      },
      async init({
        logger,
        auth: _auth,
        catalog: _catalog,
        catalogProcessingExtensionPoint,
        scheduler: _scheduler,
        notificationService: _notificationService,
      }) {
        logger.info('initialize...');

        catalogProcessingExtensionPoint.addProcessor(
          new SchedulerNotificationCatalogProcessor(
            logger,
            // auth,
            // catalog,
            // scheduler,
            // notificationService,
          ),
        );
      },
    });
  },
});
