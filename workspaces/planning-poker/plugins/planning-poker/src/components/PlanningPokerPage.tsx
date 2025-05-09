import { Page, Header, Content } from '@backstage/core-components';

import { TestCard } from './TestCard';

export const PlanningPokerPage = () => (
  <Page themeId="planning-poker">
    <Header title="Planning Poker" />
    <Content>
      <TestCard />
    </Content>
  </Page>
);
