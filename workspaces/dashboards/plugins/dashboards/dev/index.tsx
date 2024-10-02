import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { dashboardsPlugin, DashboardsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(dashboardsPlugin)
  .addPage({
    element: <DashboardsPage />,
    title: 'Root Page',
    path: '/dashboards',
  })
  .render();
