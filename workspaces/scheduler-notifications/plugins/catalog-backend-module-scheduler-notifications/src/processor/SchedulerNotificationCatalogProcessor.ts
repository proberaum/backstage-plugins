import {
  // AuthService,
  LoggerService,
  // SchedulerService,
} from '@backstage/backend-plugin-api';
import {
  Entity,
  getCompoundEntityRef,
  parseEntityRef,
  // stringifyEntityRef,
} from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import {
  CatalogProcessor,
  CatalogProcessorCache,
  CatalogProcessorEmit,
  // CatalogService,
  processingResult,
} from '@backstage/plugin-catalog-node';
// import {
//   NotificationRecipients,
//   NotificationService,
// } from '@backstage/plugin-notifications-node';

import {
  isSchedulerNotificationEntity,
  // getReceivers,
} from '@proberaum/backstage-plugin-scheduler-notifications-common';

// import { getEntity } from '../utils/catalog';

export class SchedulerNotificationCatalogProcessor implements CatalogProcessor {
  constructor(private logger: LoggerService) {}
  // private auth: AuthService,
  // private catalog: CatalogService,
  // private scheduler: SchedulerService,
  // private notificationService: NotificationService,

  getProcessorName(): string {
    return 'SchedulerNotificationCatalogProcessor';
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    if (isSchedulerNotificationEntity(entity)) {
      return true;
    }
    return false;
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    emit: CatalogProcessorEmit,
    _cache: CatalogProcessorCache,
  ): Promise<Entity> {
    if (isSchedulerNotificationEntity(entity)) {
      //
      // Create scheduled task
      //
      // this.logger.info(`Schedule task for entity ${stringifyEntityRef(entity)}...`);

      // TODO: how to cancel scheduled tasks?!
      // TODO: migrate this scheduler to the scheduler-notifications-backend
      // idea: notify the backend here and create the scheduler there...

      // const entityRef = stringifyEntityRef(entity);

      // this.scheduler.scheduleTask({
      //   id: `scheduler-notifications:${entityRef}`,
      //   fn: async () => {
      //     this.logger.info(`run... ${entityRef}`);
      //     try {
      //       const loadedEntity = await getEntity(this.auth, this.catalog, entityRef);

      //       const receivers = getReceivers(loadedEntity);

      //       const recipients: NotificationRecipients = {
      //         type: 'entity',
      //         entityRef: receivers,
      //       };

      //       this.logger.info(
      //         `will send notification for entity #${entityRef} to ${receivers}`,
      //       );
      //       await this.notificationService.send({
      //         recipients,
      //         payload: loadedEntity.spec.message,
      //       });

      //     } catch (error) {
      //       this.logger.error(`Error occurred while running task for entity ${entityRef}: ${error}`);
      //       throw error;
      //     }
      //   },
      //   frequency: entity.spec.frequency,,
      //   timeout: {
      //     seconds: 10,
      //   },
      // });

      //
      // Create relations
      //
      const thisEntityRef = getCompoundEntityRef(entity);

      entity.spec.receivers?.forEach(receiver => {
        if (typeof receiver === 'string') {
          this.logger.info(`Processing string receiver: ${receiver}`);

          const receiverRef = parseEntityRef(receiver as string, {
            // defaultKind: 'Group',
            defaultNamespace: entity.metadata.namespace,
          });
          emit(
            processingResult.relation({
              type: 'receiver',
              source: thisEntityRef,
              target: receiverRef,
            }),
          );
        } else {
          this.logger.warn(`Unhandled receiver type: ${receiver}`);
        }
      });
    }
    return entity;
  }
}
