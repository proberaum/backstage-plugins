import { createTranslationResource } from '@backstage/core-plugin-api/alpha';

import { proxyViewerTranslationRef } from './ref';

export { proxyViewerTranslationRef } from './ref';

/**
 * @public
 */
export const proxyViewerTranslations = createTranslationResource({
  ref: proxyViewerTranslationRef,
  translations: {
    de: () => import('./de'),
  },
});
