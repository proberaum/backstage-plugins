import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

/** @public */
export const planningPokerPlugin = createPlugin({
  id: 'planning-poker',
  routes: {
    root: rootRouteRef,
  },
});

/** @public */
export const PlanningPokerPage = planningPokerPlugin.provide(
  createRoutableExtension({
    name: 'PlanningPokerPage',
    component: () =>
      import('./components/PlanningPokerPage').then(m => m.PlanningPokerPage),
    mountPoint: rootRouteRef,
  }),
);
