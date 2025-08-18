import { AuthService } from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';

export async function getEntities(auth: AuthService, catalog: CatalogService) {
  const credentials = await auth.getOwnServiceCredentials();
  // TODO: add pagination to read catalog?
  const entities = await catalog.getEntities(
    {
      filter: {
        // apiVersion: 'scheduler.backstage.io/v1alpha1',
        kind: 'Notification',
      },
    },
    {
      credentials,
    },
  );
  return entities.items;
}
