import { Page, Header, Content } from '@backstage/core-components';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ConfigCard } from './ConfigCard';
import { TestCard } from './TestCard';

const queryClient = new QueryClient();

export const PlanningPokerPage = () => (
  <Page themeId="planning-poker">
    <Header title="Planning Poker" />
    <Content>
      <QueryClientProvider client={queryClient}>
        <ConfigCard />
        <br/><br/>
        <TestCard />
      </QueryClientProvider>
    </Content>
  </Page>
);
