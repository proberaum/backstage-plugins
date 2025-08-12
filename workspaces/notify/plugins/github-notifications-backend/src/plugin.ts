import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  NotificationRecipients,
  notificationService,
} from '@backstage/plugin-notifications-node';

import { getEntities, getGroupedEntities } from './utils/catalog';
import { getIssues } from './utils/github';
import {
  getNotification,
  getReceivers,
  isIssueRelevant,
} from './utils/notifications';
import { getSince, setSince } from './utils/lastrun';

/**
 * githubNotificationsPlugin backend plugin
 *
 * @public
 */
export const githubNotificationsPlugin = createBackendPlugin({
  pluginId: 'github-notifications',
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
        rootConfig,
        scheduler,
        cache,
        auth,
        catalog,
        notificationService,
      }) {
        logger.info('initialize...');

        await scheduler.scheduleTask({
          id: 'github-notifications-scheduler',
          initialDelay: { seconds: 10 },
          frequency: { seconds: 20 },
          timeout: { minutes: 1 },
          fn: async () => {
            logger.debug('scheduler is running...');

            const entities = await getEntities(auth, catalog);
            const groupedEntities = getGroupedEntities(entities);

            logger.info(
              `found ${entities.length} entities and could reduce it to ${groupedEntities.length} repos...`,
            );

            let notificationsOverall = 0;
            for await (const groupedEntity of groupedEntities) {
              let notificationsForRepo = 0;
              try {
                const since = await getSince(cache, groupedEntity.repo);

                logger.info(
                  `will load issues for repo: ${
                    groupedEntity.repo
                  } since ${since.toISOString()}...`,
                );

                const issues = await getIssues(
                  rootConfig,
                  groupedEntity.repo,
                  since,
                );
                logger.info(
                  `found ${issues.length} issues for repo ${groupedEntity.repo}`,
                );

                // Loop over entities x issues
                for await (const entity of groupedEntity.entities) {
                  logger.debug(
                    `process entity: ${stringifyEntityRef(entity)}...`,
                  );
                  const receivers = getReceivers(entity);
                  if (receivers.length === 0) {
                    logger.warn(
                      `skip entity ${stringifyEntityRef(
                        entity,
                      )} because there is no receiver configured correctly`,
                    );
                    continue;
                  }
                  const recipients: NotificationRecipients = {
                    type: 'entity',
                    entityRef: receivers,
                  };

                  for (const issue of issues) {
                    logger.debug(
                      `process issue #${issue.number} ${issue.title}`,
                    );
                    if (!isIssueRelevant(entity, issue)) {
                      continue;
                    }
                    const notification = getNotification(entity, issue);
                    logger.info(
                      `will send notification for issue #${issue.number} to ${receivers}`,
                    );
                    await notificationService.send({
                      recipients,
                      payload: notification,
                    });
                    notificationsOverall++;
                    notificationsForRepo++;
                  }
                }

                // >1 is used here instead of >0 so that we don't get load that issue again and again because it has the (exact) same updatedAt timestamp ;)
                const lastUpdatedAt =
                  issues.length > 1
                    ? new Date(
                        issues[issues.length - 1].updatedAt ??
                          issues[issues.length - 1].createdAt,
                      )
                    : new Date();
                logger.info(
                  `will check repo ${groupedEntity.repo} for updates after ${lastUpdatedAt}`,
                );

                await setSince(cache, groupedEntity.repo, lastUpdatedAt);

                logger.info(
                  `created ${notificationsForRepo} notifications for repo ${groupedEntity.repo}`,
                );
              } catch (error) {
                logger.error(
                  `failed to load issues for repo ${groupedEntity.repo}: ${error}`,
                );
              }
            }
            logger.info(
              `created ${notificationsOverall} notifications overall`,
            );
          },
        });
      },
    });
  },
});
