import React from 'react';
import { Page, Header, Content } from '@backstage/core-components';
import { DashboardCard } from './DashboardCard';
import { DashboardGrid } from './DashboardGrid';

export const DashboardPage = () => {

  return (
    <Page themeId="dashboards">
      <Header title="Dashboards" />
      <Content>
        <DashboardCard />
        <DashboardGrid />
      </Content>
    </Page>
  );
}
