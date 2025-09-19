import { createTranslationResource } from '@backstage/core-plugin-api/alpha';

import { configViewerTranslationRef } from './ref';

export { configViewerTranslationRef } from './ref';

/**
 * @public
 */
export const configViewerTranslations = createTranslationResource({
  ref: configViewerTranslationRef,
  translations: {
    de: () => import('./de'),
  },
});
