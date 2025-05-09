import {
  Page,
  InfoCard,
  Header,
  Content,
  ContentHeader,
  SupportButton,
} from '@backstage/core-components';

import { Typography } from '@material-ui/core';

export const PlanningPokerPage = () => (
  <Page themeId="planning-poker">
    <Header title="Planning Poker">
      {/* <HeaderLabel label="Owner" value="Team X" /> */}
      {/* <HeaderLabel label="Lifecycle" value="Alpha" /> */}
    </Header>
    <Content>
      <ContentHeader title="Plugin title">
        <SupportButton>A description of your plugin goes here.</SupportButton>
      </ContentHeader>
      <InfoCard title="Information card">
        <Typography variant="body1">
          All content should be wrapped in a card like this.
        </Typography>
      </InfoCard>
    </Content>
  </Page>
);
