import { createTranslationMessages } from '@backstage/core-plugin-api/alpha';

import { envViewerTranslationRef } from './ref';

const de = createTranslationMessages({
  ref: envViewerTranslationRef,
  full: true, // False means that this is a partial translation
  messages: {
    'sidebar.title': 'Umgebungsvariablen',
    'page.title': 'Umgebungsvariablen',
    'common.filterPlaceholder': 'Umgebungsvariablen filtern',
    'common.key': 'Schlüssel',
    'common.value': 'Wert',
    'common.noItemsFound': 'Keine Umgebungsvariablen gefunden.',
  },
});

export default de;
