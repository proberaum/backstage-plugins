import { AuthService } from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';

import { SchedulerNotificationEntity } from '@proberaum/backstage-plugin-scheduler-notifications-common';

export async function getEntity(auth: AuthService, catalog: CatalogService, entityRef: string) {
  const credentials = await auth.getOwnServiceCredentials();
  // TODO: add pagination to read catalog?
  const entity = await catalog.getEntityByRef(
    entityRef,
    {
      credentials,
    },
  );
  return entity as SchedulerNotificationEntity;
}
