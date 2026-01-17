import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

/**
 * @public
 */
export const proxyViewerTranslationRef = createTranslationRef({
  id: 'plugin.proxy-viewer.translation-ref',
  messages: {
    sidebar: {
      title: 'Proxy viewer',
    },
    page: {
      title: 'Proxy viewer',
    },
    common: {
      filterPlaceholder: 'Filter proxies',
    },
  },
});
