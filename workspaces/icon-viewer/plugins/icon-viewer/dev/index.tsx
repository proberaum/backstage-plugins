import { createDevApp } from '@backstage/dev-utils';
import { iconViewerPlugin, IconViewerPage } from '../src/plugin';

createDevApp()
  .registerPlugin(iconViewerPlugin)
  .addPage({
    element: <IconViewerPage />,
    title: 'Root Page',
    path: '/icon-viewer',
  })
  .render();
