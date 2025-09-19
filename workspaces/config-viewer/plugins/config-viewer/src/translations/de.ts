import { createTranslationMessages } from '@backstage/core-plugin-api/alpha';

import { configViewerTranslationRef } from './ref';

const de = createTranslationMessages({
  ref: configViewerTranslationRef,
  full: true, // False means that this is a partial translation
  messages: {
    'sidebar.title': 'Konfiguration',
    'page.title': 'Konfiguration',
    'common.filterPlaceholder': 'Konfiguration filtern',
  },
});

export default de;
