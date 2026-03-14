import { AnalyticsApi, AnalyticsEvent } from '@backstage/core-plugin-api';

import {
  AnalyticsApi as NewAnalyticsApi,
  AnalyticsEvent as NewAnalyticsEvent,
} from '@backstage/frontend-plugin-api';

/**
 * @public
 */
export class BrowserLogAnalyticsApi implements AnalyticsApi, NewAnalyticsApi {
  captureEvent(event: AnalyticsEvent | NewAnalyticsEvent) {
    // eslint-disable-next-line no-console
    console.log('Analytics event:', event);
  }
}
