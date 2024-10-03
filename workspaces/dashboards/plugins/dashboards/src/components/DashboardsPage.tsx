import React from 'react';
import { Page, Header, Content } from '@backstage/core-components';
import { DashboardsTable } from './DashboardsTable';

export const DashboardsPage = () => {
  return (
    <Page themeId="dashboards">
      <Header title="Dashboards" />
      <Content>
        <DashboardsTable />
      </Content>
    </Page>
  );
}
