import type { Entity } from '@backstage/catalog-model';
import type { HumanDuration } from '@backstage/types';
import type { NotificationPayload } from '@backstage/plugin-notifications-common';

export type SchedulerNotificationReceiver = string | {
  pick: number;
  from: string;
  after: string;
  before: string;
};

export type SchedulerNotificationFrequency = {
  cron: string;
} | HumanDuration;

export type SchedulerNotificationSpec = {
  frequency: SchedulerNotificationFrequency;
  receivers: Array<SchedulerNotificationReceiver>;
  message: NotificationPayload;
};

export type SchedulerNotificationEntity = Entity & {
  spec: SchedulerNotificationSpec;
};
