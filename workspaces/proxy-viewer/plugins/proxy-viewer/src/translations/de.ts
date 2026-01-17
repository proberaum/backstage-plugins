import { createTranslationMessages } from '@backstage/core-plugin-api/alpha';

import { proxyViewerTranslationRef } from './ref';

const de = createTranslationMessages({
  ref: proxyViewerTranslationRef,
  full: true, // False means that this is a partial translation
  messages: {
    'sidebar.title': 'Proxy viewer',
    'page.title': 'Proxy viewer',
    'common.filterPlaceholder': 'Proxy filtern',
  },
});

export default de;
