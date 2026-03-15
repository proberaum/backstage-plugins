import { createDevApp } from '@backstage/dev-utils';
import { proxyViewerPlugin, ProxyViewerPage } from '../src/plugin';

createDevApp()
  .registerPlugin(proxyViewerPlugin)
  .addPage({
    element: <ProxyViewerPage />,
    title: 'Root Page',
    path: '/proxy-viewer',
  })
  .render();
