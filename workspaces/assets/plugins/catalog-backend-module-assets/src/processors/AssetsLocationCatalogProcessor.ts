import { Config } from '@backstage/config';
import {
  Entity,
  getCompoundEntityRef,
  parseEntityRef,
  RELATION_CHILD_OF,
  RELATION_PARENT_OF,
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

export class AssetsLocationCatalogProcessor implements CatalogProcessor {
  private readonly kinds: string[];

  constructor({ config }: Options) {
    this.kinds = config?.getOptionalStringArray('kinds.locations') ?? [
      'Shelf',
      'Room',
      'Floor',
      'Building',
      'Campus',
    ];
    if (this.kinds.some(kind => kind.toLowerCase() === 'location')) {
      throw new Error(
        'The assets plugin forbids using the kind "Location" due the high-risk of misconfiguration. A Backstage Location might allow users to import other resources into the catalog. We recommend to use the predefined or a more specific kind instead.',
      );
    }
  }

  getProcessorName(): string {
    return 'AssetsLocationCatalogProcessor';
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
      const parent = entity.spec?.parent as string;
      if (parent) {
        const sourceRef = getCompoundEntityRef(entity);
        const targetRef = parseEntityRef(parent, {
          defaultNamespace: sourceRef.namespace,
        });
        emit(
          processingResult.relation({
            type: RELATION_CHILD_OF,
            source: sourceRef,
            target: targetRef,
          }),
        );
        emit(
          processingResult.relation({
            type: RELATION_PARENT_OF,
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
