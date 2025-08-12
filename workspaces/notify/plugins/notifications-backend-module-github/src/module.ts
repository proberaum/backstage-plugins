import { coreServices, createBackendModule } from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { NotificationRecipients, notificationService } from '@backstage/plugin-notifications-node';

import { getEntities, getGroupedEntities } from './utils/catalog';
import { getIssues } from './utils/github';
import { getNotification, getReceivers, isIssueRelevant } from './utils/notifications';
import { getSince, setSince } from './utils/lastrun';

export const notificationsModuleGithubIssues = createBackendModule({
  pluginId: 'notifications',
  moduleId: 'github',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        rootConfig: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
        cache: coreServices.cache,
        auth: coreServices.auth,
        catalog: catalogServiceRef,
        notificationService: notificationService,
      },
      async init({ logger, rootConfig, scheduler, cache, auth, catalog, notificationService }) {
        logger.info('initialize notifications github module...');

        await scheduler.scheduleTask({
          id: 'notifications-github-scheduler',
          initialDelay: { seconds: 10 },
          frequency: { minutes: 10 },
          timeout: { minutes: 1 },
          fn: async () => {
            logger.debug('notifications github scheduler is running...');

            const entities = await getEntities(auth, catalog);
            const groupedEntities = getGroupedEntities(entities);

            logger.info(`notifications github module found ${entities.length} entities and could reduce it to ${groupedEntities.length} repos...`);

            let notificationsOverall = 0;
            for await (const groupedEntity of groupedEntities) {
              let notificationsForRepo = 0;
              try {
                const since = await getSince(cache, groupedEntity.repo);

                logger.info(`notifications github module will load issues for repo: ${groupedEntity.repo} since ${since.toISOString()}...`);

                const issues = await getIssues(rootConfig, groupedEntity.repo, since);
                logger.info(`notifications github module found ${issues.length} issues for repo ${groupedEntity.repo}`);

                // Loop over entities x issues
                for await (const entity of groupedEntity.entities) {
                  logger.debug(`notifications github module process entity: ${stringifyEntityRef(entity)}...`);
                  const receivers = getReceivers(entity);
                  if (receivers.length === 0) {
                    logger.warn(`notifications github module skip entity ${stringifyEntityRef(entity)} because there is no receiver configured correctly`);
                    continue;
                  }
                  const recipients: NotificationRecipients = {
                    type: 'entity',
                    entityRef: receivers,
                  };

                  for (const issue of issues) {
                    logger.debug(`notifications github module process issue #${issue.number} ${issue.title}`);
                    if (!isIssueRelevant(entity, issue)) {
                      continue;
                    }
                    const notification = getNotification(entity, issue);
                    logger.info(`notifications github module will send notification for issue #${issue.number} to ${receivers}`);
                    await notificationService.send({
                      recipients,
                      payload: notification,
                    });
                    notificationsOverall++;
                    notificationsForRepo++;
                  }
                }

                // >1 is used here instead of >0 so that we don't get load that issue again and again because it has the (exact) same updatedAt timestamp ;)
                const lastUpdatedAt = issues.length > 1 ? new Date(issues[issues.length - 1].updatedAt ?? issues[issues.length - 1].createdAt) : new Date();
                logger.info(`notifications github module will check repo ${groupedEntity.repo} for updates after ${lastUpdatedAt}`);

                await setSince(cache, groupedEntity.repo, lastUpdatedAt);

                logger.info(`notifications github module created ${notificationsForRepo} notifications for repo ${groupedEntity.repo}`);
              } catch (error) {
                logger.error(`notifications github module failed to load issues for repo ${groupedEntity.repo}: ${error}`);
              }
            }
            logger.info(`notifications github module created ${notificationsOverall} notifications overall`);
          },
        });
      },
    });
  },
});
