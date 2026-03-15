import { createTranslationMessages } from '@backstage/core-plugin-api/alpha';

import { proxyViewerTranslationRef } from './ref';

const de = createTranslationMessages({
  ref: proxyViewerTranslationRef,
  full: false, // False means that this is a partial translation
  messages: {
    'sidebar.title': 'Proxy viewer',
    'page.title': 'Proxy viewer',
    'common.filterPlaceholder': 'Proxy filtern',
    // TODO
  },
});

export default de;
