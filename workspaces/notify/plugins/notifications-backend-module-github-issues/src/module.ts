import { coreServices, createBackendModule } from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { stringifyEntityRef } from '@backstage/catalog-model';
import { NotificationRecipients, notificationService } from '@backstage/plugin-notifications-node';

import { getEntities, getGroupedEntities } from './utils/catalog';
import { getLastIssues } from './utils/github';
import { getNotification, getReceivers, isIssueRelevant } from './utils/notifications';

export const notificationsModuleGithubIssues = createBackendModule({
  pluginId: 'notifications',
  moduleId: 'github-issues',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        rootConfig: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
        auth: coreServices.auth,
        catalog: catalogServiceRef,
        notificationService: notificationService,
      },
      async init({ logger, rootConfig, scheduler, auth, catalog, notificationService }) {
        logger.info('initialize notifications github-issues module...');

        await scheduler.scheduleTask({
          id: 'notifications-github-issues-scheduler',
          initialDelay: { seconds: 10 },
          // TODO
          frequency: { seconds: 30 },
          timeout: { seconds: 10 },
          fn: async () => {
            logger.info('notifications github-issues scheduler is running...');

            const entities = await getEntities(auth, catalog);
            const groupedEntities = getGroupedEntities(entities);

            logger.info(`notifications github-issues module found ${entities.length} entities and could reduce it to ${groupedEntities.length} repos...`);

            for await (const groupedEntity of groupedEntities) {
              try {
                logger.info(`notifications github-issues module will load issues for repo: ${groupedEntity.repo}...`);

                const issues = await getLastIssues(rootConfig, groupedEntity.repo);
                logger.info(`notifications github-issues module found ${issues.length} issues for repo ${groupedEntity.repo}`);

                // Loop over entities x issues
                for await (const entity of groupedEntity.entities) {
                  logger.info(`notifications github-issues module process entity: ${stringifyEntityRef(entity)}...`);
                  const receivers = getReceivers(entity);
                  if (receivers.length === 0) {
                    continue;
                  }
                  const recipients: NotificationRecipients = {
                    type: 'entity',
                    entityRef: receivers,
                  };

                  for (const issue of issues) {
                    logger.debug(`notifications github-issues module process issue #${issue.number} ${issue.title}`);
                    if (!isIssueRelevant(entity, issue)) {
                      continue;
                    }
                    const notification = getNotification(entity, issue);
                    logger.info(`notifications github-issues module will send notification for issue #${issue.number} to ${receivers}`);
                    await notificationService.send({
                      recipients,
                      payload: notification,
                    });
                  }
                }
              } catch (error) {
                logger.error(`notifications github-issues module failed to load issues for repo: ${groupedEntity.repo}: ${error}`);
              }
            }
          },
        });
      },
    });
  },
});
