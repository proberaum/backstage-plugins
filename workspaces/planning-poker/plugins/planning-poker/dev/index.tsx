import { createDevApp } from '@backstage/dev-utils';
import { planningPokerPlugin, PlanningPokerPage } from '../src/plugin';

createDevApp()
  .registerPlugin(planningPokerPlugin)
  .addPage({
    element: <PlanningPokerPage />,
    title: 'Root Page',
    path: '/planning-poker',
  })
  .render();
