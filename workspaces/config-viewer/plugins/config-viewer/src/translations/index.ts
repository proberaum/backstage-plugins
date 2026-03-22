import { createTranslationResource } from '@backstage/frontend-plugin-api';

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
