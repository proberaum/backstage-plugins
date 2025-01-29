import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { assetsPlugin, AssetsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(assetsPlugin)
  .addPage({
    element: <AssetsPage />,
    title: 'Root Page',
    path: '/assets',
  })
  .render();
