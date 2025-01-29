import { Entity } from '@backstage/catalog-model';
import { CatalogProcessor } from '@backstage/plugin-catalog-node';

export class AssetsPlaceCatalogProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'AssetsPlaceCatalogProcessor';
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    // TODO: validate schema
    return (
      entity.apiVersion === 'assets.backstage.io/v1alpha1' &&
      entity.kind === 'Place'
    );
  }
}
