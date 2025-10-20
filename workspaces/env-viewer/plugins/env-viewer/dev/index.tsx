import { createDevApp } from '@backstage/dev-utils';
import { envViewerPlugin, EnvViewerPage } from '../src/plugin';

createDevApp()
  .registerPlugin(envViewerPlugin)
  .addPage({
    element: <EnvViewerPage />,
    title: 'Root Page',
    path: '/env-viewer',
  })
  .render();
