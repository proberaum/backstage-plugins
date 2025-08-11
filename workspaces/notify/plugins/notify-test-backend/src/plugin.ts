import { coreServices, createBackendPlugin } from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { NotificationPayload } from '@backstage/plugin-notifications-common';
import { NotificationRecipients, notificationService } from '@backstage/plugin-notifications-node';
import { CATALOG_FILTER_EXISTS } from '@backstage/catalog-client';

/**
 * notifyTestPlugin backend plugin
 *
 * @public
 */
export const notifyTestPlugin = createBackendPlugin({
  pluginId: 'notify-test',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
        auth: coreServices.auth,
        catalog: catalogServiceRef,
        notificationService: notificationService,
      },
      async init({ logger, scheduler, auth, catalog, notificationService }) {

        logger.info('NotifyTestPlugin init');

        await scheduler.scheduleTask({
          id: 'notify-all-components',
          frequency: { seconds: 10 },
          timeout: { seconds: 10 },
          fn: async () => {
            logger.info('NotifyTestPlugin is running...');

            const credentials = await auth.getOwnServiceCredentials()

            // TODO: add pagination to read catalog?
            const entities = await catalog.getEntities({
              filter: {
                kind: 'Component',
                'metadata.annotations.notify': CATALOG_FILTER_EXISTS,
              },
            }, {
              credentials,
            });

            logger.info(`NotifyTestPlugin found ${entities.items.length} entities...`);

            for await (const entity of entities.items) {
              logger.info(`NotifyTestPlugin processing entity: ${entity.metadata.name}....`);
              const annotations = entity.metadata.annotations || {};

              const notifyAnnotation = annotations.notify;

              const entityRefs: string[] = [];

              // TODO: not sure if this notifies just the owner or other relationships as well
              if (notifyAnnotation?.split(',').map(ref => ref.trim()).includes('owner')) {
                entityRefs.push(stringifyEntityRef(entity));
              }
              if (notifyAnnotation) {
                entityRefs.push(...notifyAnnotation?.split(',').map(ref => ref.trim()).filter(ref => ref.startsWith('user:') || ref.startsWith('group:')));
              }
              if (!entityRefs || entityRefs.length === 0) {
                logger.warn(`NotifyTestPlugin skipping entity ${entity.metadata.name} as it has no valid notify annotations`);
                continue;
              }

              // TODO: replace demo payload with real payload
              const title = '🚀 RBAC: Evaluation without users in catalog 22';
              const description = 'New GitHub issue #2077';
              const link = 'https://github.com/backstage/community-plugins/issues/2077';
              const severity = 'normal';
              const topic = annotations['notify/topic'] ?? `${entity.metadata.name} notifications`;
              const scope = `https://github.com/backstage/community-plugins/issues/2077`;
                // https://backstage.io/docs/getting-started/app-custom-theme/#icons
                // https://github.com/backstage/backstage/blob/master/packages/app-defaults/src/defaults/icons.tsx
              const icon = 'github';

              const payload: NotificationPayload = {
                title,
                description,
                link,
                severity,
                topic,
                scope,
                icon,
              };

              const recipients: NotificationRecipients = {
                type: 'entity',
                entityRef: entityRefs,
              };

              await notificationService.send({
                recipients,
                payload,
              });
            }
          },
        });
      },
    });
  },
});
