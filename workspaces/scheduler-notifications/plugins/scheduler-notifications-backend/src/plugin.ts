import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import {
  NotificationRecipients,
  notificationService,
} from '@backstage/plugin-notifications-node';

import {
  isSchedulerNotificationEntity,
  getReceivers,
} from '@proberaum/backstage-plugin-scheduler-notifications-common';

import { getEntities } from './utils/catalog';

/**
 * schedulerNotificationsPlugin backend plugin
 *
 * @public
 */
export const schedulerNotificationsPlugin = createBackendPlugin({
  pluginId: 'scheduler-notifications',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        rootConfig: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
        cache: coreServices.cache,
        auth: coreServices.auth,
        catalog: catalogServiceRef,
        notificationService: notificationService,
      },
      async init({
        logger,
        rootConfig: _rootConfig,
        scheduler,
        cache: _cache,
        auth,
        catalog,
        notificationService,
      }) {
        logger.info('initialize...');

        scheduler.scheduleTask({
          id: `get-entities`,
          fn: async () => {
            logger.info(`get entities...`);
            const entities = await getEntities(auth, catalog);

            for await (const entity of entities) {
              const entityRef = stringifyEntityRef(entity);

              if (isSchedulerNotificationEntity(entity)) {
                //
                // Create scheduled task
                //
                logger.info(`Schedule task for entity ${entityRef}...`);

                // TODO: how to cancel scheduled tasks?!

                if (entity.metadata.name === 'all-teams-sprint-end-tomorrow') {
                  scheduler
                    .createScheduledTaskRunner({
                      frequency: entity.spec.frequency,
                      timeout: {
                        seconds: 10,
                      },
                    })
                    .run({
                      id: `scheduler-notifications:${entityRef}`,
                      fn: async () => {
                        logger.info(`run... ${entityRef}`);
                        try {
                          const receivers = getReceivers(entity);

                          const recipients: NotificationRecipients = {
                            type: 'entity',
                            entityRef: receivers,
                          };

                          logger.info(
                            `will send notification for entity #${entityRef} to ${receivers}`,
                          );
                          await notificationService.send({
                            recipients,
                            payload: entity.spec.message,
                          });
                        } catch (error) {
                          logger.error(
                            `Error occurred while running task for entity ${entityRef}: ${error}`,
                          );
                          throw error;
                        }
                      },
                    });
                } else {
                  scheduler.scheduleTask({
                    id: `scheduler-notifications:${entityRef}`,
                    fn: async () => {
                      logger.info(`run... ${entityRef}`);
                      try {
                        const receivers = getReceivers(entity);

                        const recipients: NotificationRecipients = {
                          type: 'entity',
                          entityRef: receivers,
                        };

                        logger.info(
                          `will send notification for entity #${entityRef} to ${receivers}`,
                        );
                        await notificationService.send({
                          recipients,
                          payload: entity.spec.message,
                        });
                      } catch (error) {
                        logger.error(
                          `Error occurred while running task for entity ${entityRef}: ${error}`,
                        );
                        throw error;
                      }
                    },
                    frequency: entity.spec.frequency,
                    timeout: {
                      seconds: 10,
                    },
                  });
                }
              } else {
                logger.info(`Unsupported entity ${entityRef}...`);
              }
            }
          },
          frequency: {
            minutes: 5,
          },
          initialDelay: {
            seconds: 20,
          },
          timeout: {
            seconds: 30,
          },
        });
      },
    });
  },
});
