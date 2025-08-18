import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';

import { SchedulerNotificationEntity } from '@proberaum/backstage-plugin-scheduler-notifications-common';

/**
 * Converts a receiver annotation into a list of entity references.
 * The annotation can contain:
 * - `owner` (entity owner)
 * - `user:username`
 * - `group:groupname`
 */
export function getReceivers(entity: SchedulerNotificationEntity): string[] {
  const entityRefs: string[] = [];

  entity.spec.receivers?.forEach((receiver) => {
    if (typeof receiver === 'string') {
      const receiverRef = parseEntityRef(receiver as string, {
        // defaultKind: 'Group',
        defaultNamespace: entity.metadata.namespace,
      });
      entityRefs.push(stringifyEntityRef(receiverRef));
    }
  });

  return entityRefs;
}
