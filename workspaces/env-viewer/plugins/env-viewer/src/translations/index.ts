import { createTranslationResource } from '@backstage/core-plugin-api/alpha';

import { envViewerTranslationRef } from './ref';

export { envViewerTranslationRef } from './ref';

/**
 * @public
 */
export const envViewerTranslations = createTranslationResource({
  ref: envViewerTranslationRef,
  translations: {
    de: () => import('./de'),
  },
});
