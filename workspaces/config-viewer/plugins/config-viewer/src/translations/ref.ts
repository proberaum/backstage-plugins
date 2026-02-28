import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

/**
 * @public
 */
export const configViewerTranslationRef = createTranslationRef({
  id: 'plugin.config-viewer.translation-ref',
  messages: {
    sidebar: {
      title: 'Config viewer',
    },
    page: {
      title: 'Config viewer',
    },
    common: {
      filterPlaceholder: 'Filter config keys',
    },
  },
});
