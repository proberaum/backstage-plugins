import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { navModule } from './modules/nav';

import { configViewerTranslationModule } from '@proberaum/backstage-plugin-config-viewer/src/plugin';

export default createApp({
  features: [catalogPlugin, navModule, configViewerTranslationModule],
});
