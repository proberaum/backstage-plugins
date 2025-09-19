import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

/**
 * @public
 */
export const configViewerTranslationRef = createTranslationRef({
  id: 'plugin.config-viewer.translation-ref',
  messages: {
    sidebar: {
      title: 'Config Viewer',
    },
    page: {
      title: 'Config Viewer',
    },
    common: {
      filterPlaceholder: 'Filter config keys',
    },
  },
});
