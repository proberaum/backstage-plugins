import React from 'react';
import { Page, Header, Content } from '@backstage/core-components';
import { DashboardCard } from './DashboardCard';

export const DashboardPage = () => {
  return (
    <Page themeId="dashboards">
      <Header title="Dashboards" />
      <Content>
        <DashboardCard />
      </Content>
    </Page>
  );
}
