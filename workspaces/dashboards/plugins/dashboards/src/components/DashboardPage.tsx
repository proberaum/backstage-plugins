import React from 'react';
import {
  Page,
  Header,
  HeaderLabel,
  HeaderActionMenu,
  HeaderActionMenuItem,
  TabbedLayout,
  FavoriteToggle,
  Link,
} from '@backstage/core-components';
import Tab from '@material-ui/core/Tab'
import AddIcon from '@material-ui/icons/Add';
import { DashboardCard } from './DashboardCard';
import { DashboardGrid } from './DashboardGrid';

interface Label {
  id: string;
  label: string;
  value: string;
}

const AddIconTab = (props: any) => (
  <Tab
    icon={<AddIcon />}
    component={Link}
    {...props}
  />
);

export const DashboardPage = () => {
  const [isFavorite, setIsFavorite] = React.useState(true);

  const title = "My dashboard";

  const favoriteToggleTooltip = !isFavorite ?
    'Add to favorites' :
    'Remove from favorites';

  // Aligned with backstage catalog
  const titleComponent = (
    <div style={{ display: 'inline-flex', alignItems: 'center', height: '1em', maxWidth: '100%' }}>
      <div>{title}</div>
      <FavoriteToggle id="x" title={favoriteToggleTooltip} isFavorite={isFavorite} onToggle={setIsFavorite} />
    </div>
  );

  const headerLabels: Label[] = [
    {
      id: 'a',
      label: 'Owner',
      value: 'Team X',
    },
    {
      id: 'b',
      label: 'Lifecycle',
      value: 'Alpha',
    },
  ];

  const actionItems: HeaderActionMenuItem[] = [
    {
      label: 'Edit dashboard',
    },
    {
      label: 'Share dashboard',
    },
    {
      label: 'Remove dashboard',
    },
  ];

  return (
    <Page themeId="dashboards">
      <Header type="Dashboard" title={titleComponent}>
        {headerLabels.map((headerLabel) => (
          <HeaderLabel
            key={headerLabel.id}
            label={headerLabel.label}
            value={headerLabel.value}
          />
        ))}
        {actionItems?.length > 0 ?
          <HeaderActionMenu actionItems={actionItems} /> :
          null
        }
      </Header>

      <TabbedLayout>
        <TabbedLayout.Route path="/" title="Card">
          <DashboardCard />
        </TabbedLayout.Route>
        <TabbedLayout.Route path="/grid" title="Grid">
          <DashboardGrid />
        </TabbedLayout.Route>
        <TabbedLayout.Route path="/add" title="Add" tabProps={{
          component: AddIconTab,
        }}>
          <div>add</div>
        </TabbedLayout.Route>
      </TabbedLayout>

    </Page>
  );
}
