import {
  Entity,
  getCompoundEntityRef,
  parseEntityRef,
} from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common/index';
import {
  CatalogProcessor,
  CatalogProcessorCache,
  CatalogProcessorEmit,
  processingResult,
} from '@backstage/plugin-catalog-node';

export class AssetsItemCatalogProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'AssetsItemCatalogProcessor';
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    // TODO: validate schema
    return (
      entity.apiVersion === 'assets.backstage.io/v1alpha1' &&
      entity.kind === 'Item'
    );
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    emit: CatalogProcessorEmit,
    _cache: CatalogProcessorCache,
  ): Promise<Entity> {
    if (
      entity.apiVersion === 'assets.backstage.io/v1alpha1' &&
      entity.kind === 'Item'
    ) {
      const place = entity.spec?.place as string;
      if (place) {
        const sourceRef = getCompoundEntityRef(entity);
        const targetRef = parseEntityRef(place, {
          defaultKind: 'Place',
          defaultNamespace: sourceRef.namespace,
        });
        emit(
          processingResult.relation({
            type: 'placed',
            source: sourceRef,
            target: targetRef,
          }),
        );
        emit(
          processingResult.relation({
            type: 'contains',
            source: targetRef,
            target: sourceRef,
          }),
        );
      }
      return entity;
    }
    return entity;
  }
}
