import type { Entity } from '@backstage/catalog-model';

import type { SchedulerNotificationEntity } from '../types';

export function isSchedulerNotificationEntity(
  entity?: Entity,
): entity is SchedulerNotificationEntity {
  return (
    !!entity &&
    (entity.apiVersion === 'scheduler.backstage.io/v1alpha1') &&
    entity.kind === 'Notification');
}
