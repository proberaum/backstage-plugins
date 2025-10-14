import { Config } from '@backstage/config';
import {
  Entity,
  getCompoundEntityRef,
  parseEntityRef,
  RELATION_HAS_PART,
  RELATION_PART_OF,
} from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import {
  CatalogProcessor,
  CatalogProcessorCache,
  CatalogProcessorEmit,
  processingResult,
} from '@backstage/plugin-catalog-node';

interface Options {
  config?: Config;
}

export class AssetsItemCatalogProcessor implements CatalogProcessor {
  private readonly kinds: string[];

  getProcessorName(): string {
    return 'AssetsItemCatalogProcessor';
  }

  constructor({ config }: Options) {
    this.kinds = config?.getOptionalStringArray('kinds.items') ?? [
      'Item',
      'Container',
    ];
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    // TODO: validate schema
    return (
      entity.apiVersion === 'assets.backstage.io/v1alpha1' &&
      this.kinds.includes(entity.kind)
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
      this.kinds.includes(entity.kind)
    ) {
      const location = entity.spec?.location as string;
      if (location) {
        const sourceRef = getCompoundEntityRef(entity);
        const targetRef = parseEntityRef(location, {
          defaultNamespace: sourceRef.namespace,
        });
        emit(
          processingResult.relation({
            type: RELATION_PART_OF,
            source: sourceRef,
            target: targetRef,
          }),
        );
        emit(
          processingResult.relation({
            type: RELATION_HAS_PART,
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
