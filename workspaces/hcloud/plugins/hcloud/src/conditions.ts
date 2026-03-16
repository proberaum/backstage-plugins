// plugins/hcloud/src/conditions.ts
import { Entity } from '@backstage/catalog-model';
import { HCLOUD_SERVER_ANNOTATION } from '@proberaum/backstage-plugin-hcloud-common';

/**
 * @public
 */
export function isHcloudServerAvailable(entity: Entity): boolean {
  return Boolean(entity.metadata.annotations?.[HCLOUD_SERVER_ANNOTATION]);
}
