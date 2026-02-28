import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

/**
 * @public
 */
export const envViewerTranslationRef = createTranslationRef({
  id: 'plugin.env-viewer.translation-ref',
  messages: {
    sidebar: {
      title: 'Env viewer',
    },
    page: {
      title: 'Env viewer',
    },
    common: {
      filterPlaceholder: 'Filter environment variables',
      key: 'Key',
      value: 'Value',
      noItemsFound: 'No environment variables found.',
    },
  },
});
