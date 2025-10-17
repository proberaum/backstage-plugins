import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

/**
 * @public
 */
export const iconViewerTranslationRef = createTranslationRef({
  id: 'plugin.icon-viewer.translation-ref',
  messages: {
    sidebar: {
      title: 'Icon viewer',
    },
    page: {
      title: 'Icon viewer',
    },
    common: {
      filterPlaceholder: 'Filter icons',
    },
  },
});
