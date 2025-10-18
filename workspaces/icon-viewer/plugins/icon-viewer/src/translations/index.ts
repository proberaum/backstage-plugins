import { createTranslationResource } from '@backstage/core-plugin-api/alpha';

import { iconViewerTranslationRef } from './ref';

export { iconViewerTranslationRef } from './ref';

/**
 * @public
 */
export const iconViewerTranslations = createTranslationResource({
  ref: iconViewerTranslationRef,
  translations: {
    de: () => import('./de'),
  },
});
