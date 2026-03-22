import {
  createFrontendModule,
  createFrontendPlugin,
  PageBlueprint,
  SubPageBlueprint,
} from '@backstage/frontend-plugin-api';
import {
  TranslationBlueprint,
} from '@backstage/plugin-app-react';

import { Icon } from './components/Icon';

import { rootRouteRef } from './routes';
import { configViewerTranslations } from './translations';

export const configViewerPage = PageBlueprint.make({
  name: 'ConfigViewerPage',
  params: {
    path: '/config-viewer',
    title: 'Config viewer',
    icon: <Icon />,
    noHeader: true,
    routeRef: rootRouteRef,
    loader: () =>
      import('./components/ConfigViewerPage').then(m =>
        <m.ConfigViewerPage />,
      ),
  },
});

export const devtoolsSubpage = SubPageBlueprint.make({
  name: 'ConfigViewerSubPage',
  attachTo: {
    id: 'page:devtools',
    input: 'pages',
  },
  params: {
    path: 'config-viewer',
    title: 'Config viewer',
    icon: <Icon />,
    loader: () =>
      import('./components/ConfigViewerSubPage').then(m =>
        <m.ConfigViewerSubPage />,
      ),
  },
});

// TODO: fix type
export const configViewerTranslation: any = TranslationBlueprint.make({
  name: 'ConfigViewerTranslation',
  params: {
    resource: configViewerTranslations,
  }
});

export const configViewerPlugin = createFrontendPlugin({
  pluginId: 'config-viewer',
  extensions: [configViewerPage, devtoolsSubpage],
  routes: {
    root: rootRouteRef,
  }
});

export const configViewerTranslationModule = createFrontendModule({
  pluginId: 'app',
  extensions: [configViewerTranslation],
});
