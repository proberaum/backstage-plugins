import { createDevApp } from '@backstage/dev-utils';
import { configViewerPlugin, ConfigViewerPage } from '../src/plugin';

createDevApp()
  .registerPlugin(configViewerPlugin)
  .addPage({
    element: <ConfigViewerPage />,
    title: 'Root Page',
    path: '/config-viewer',
  })
  .render();
