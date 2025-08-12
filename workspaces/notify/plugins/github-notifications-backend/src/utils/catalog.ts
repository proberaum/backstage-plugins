import { AuthService } from '@backstage/backend-plugin-api';
import { CatalogService } from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';
import { CATALOG_FILTER_EXISTS } from '@backstage/catalog-client';

import { NotificationsGitHubAnnotation } from '../annotations';

export type GroupedEntity = { repo: string, entities: Entity[] };

export async function getEntities(auth: AuthService, catalog: CatalogService) {
  const credentials = await auth.getOwnServiceCredentials()
  // TODO: add pagination to read catalog?
  const entities = await catalog.getEntities({
    filter: {
      [`metadata.annotations.${NotificationsGitHubAnnotation.PROJECT_SLUG}`]: CATALOG_FILTER_EXISTS,
      [`metadata.annotations.${NotificationsGitHubAnnotation.NOTIFY}`]: CATALOG_FILTER_EXISTS,
    },
    fields: [
      'apiVersion',
      'kind',
      'metadata.namespace',
      'metadata.name',
      'metadata.annotations',
    ],
  }, {
    credentials,
  });
  return entities.items;
}

function getRepo(entity: Entity): string | null {
  return entity.metadata.annotations?.[NotificationsGitHubAnnotation.PROJECT_SLUG] ?? null;
}

export function getGroupedEntities(entities: Entity[]): GroupedEntity[] {
  const map = entities.reduce((acc, entity) => {
    const repo = getRepo(entity);
    if (repo) {
      if (!acc[repo]) {
        acc[repo] = {
          repo,
          entities: [],
        };
      }
      acc[repo].entities.push(entity);
    }
    return acc;
  }, {} as Record<string, GroupedEntity>);
  return Object.values(map);
}
