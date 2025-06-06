import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const planningPokerPlugin = createPlugin({
  id: 'planning-poker',
  routes: {
    root: rootRouteRef,
  },
});

export const PlanningPokerPage = planningPokerPlugin.provide(
  createRoutableExtension({
    name: 'PlanningPokerPage',
    component: () =>
      import('./components/PlanningPokerPage').then(m => m.PlanningPokerPage),
    mountPoint: rootRouteRef,
  }),
);
