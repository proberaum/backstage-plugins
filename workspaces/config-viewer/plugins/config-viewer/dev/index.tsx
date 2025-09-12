import { createDevApp } from '@backstage/dev-utils';
import { configViewerPlugin, ConfigViewerPage } from '../src/plugin';

createDevApp()
  .registerPlugin(configViewerPlugin)
  .addPage({
    element: <ConfigViewerPage />,
    title: 'Config Viewer',
    path: '/config-viewer',
  })
  .render();
