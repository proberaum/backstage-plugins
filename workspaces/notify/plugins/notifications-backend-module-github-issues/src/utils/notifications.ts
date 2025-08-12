import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { NotificationPayload, NotificationSeverity } from '@backstage/plugin-notifications-common';

import { NotificationsGitHubAnnotation } from '../annotations';

import { Issue } from './github';

/**
 * Converts a receiver annotation into a list of entity references.
 * The annotation can contain:
 * - `owner` (entity owner)
 * - `user:username`
 * - `group:groupname`
 */
export function getReceivers(entity: Entity): string[] {
  const notify = entity.metadata.annotations?.[NotificationsGitHubAnnotation.NOTIFY];
  if (!notify) {
    return [];
  }

  const entityRefs: string[] = [];
  // TODO: not sure if this notifies just the owner or other relationships as well
  if (notify.split(',').map(ref => ref.trim()).includes('owner')) {
    entityRefs.push(stringifyEntityRef(entity));
  }
  entityRefs.push(...notify.split(',').map(ref => ref.trim()).filter(ref => ref.startsWith('user:') || ref.startsWith('group:')));
  return entityRefs;
}

const severityLevels = ['critical', 'high', 'normal', 'low'];

export function isIssueRelevant(entity: Entity, issue: Issue): boolean {
  const labelFilter = entity.metadata.annotations?.[NotificationsGitHubAnnotation.LABEL_FILTER]?.split(',').map(label => label.trim());
  if (labelFilter && labelFilter.length > 0) {
    if (!issue.labels.some(label => labelFilter.includes(label))) {
      return false;
    }
  }

  const subjectFilter = entity.metadata.annotations?.[NotificationsGitHubAnnotation.SUBJECT_FILTER]?.split(',').map(subject => subject.trim().toLocaleLowerCase('en-US'));
  if (subjectFilter) {
    const subject = issue.title.toLocaleLowerCase('en-US');
    if (!subjectFilter.some(filter => subject.includes(filter))) {
      return false;
    }
  }

  return true;
}

export function getNotification(entity: Entity, issue: Issue): NotificationPayload {
  const repo = entity.metadata.annotations?.[NotificationsGitHubAnnotation.PROJECT_SLUG] ?? 'unknown-repo';

  // TODO: replace demo payload with real payload
  const title = issue.title;

  let description = `GitHub issue #${issue.number} in ${repo} by ${issue.author}`;
  if (issue.state === 'CLOSED') {
    description += ' (closed)';
  }

  const link = issue.url;

  let severity = entity.metadata.annotations?.[NotificationsGitHubAnnotation.SEVERITY] as NotificationSeverity | undefined;
  if (severity && !severityLevels.includes(severity)) {
    severity = undefined;
  }

  const topic = entity.metadata.annotations?.[NotificationsGitHubAnnotation.TOPIC] ?? `${entity.metadata.name} notifications`;

  const scope = issue.url;

  // https://backstage.io/docs/getting-started/app-custom-theme/#icons
  // https://github.com/backstage/backstage/blob/master/packages/app-defaults/src/defaults/icons.tsx
  const icon = 'github';

  const payload: NotificationPayload = {
    title,
    description,
    link,
    severity,
    topic,
    scope,
    icon,
  };
  return payload;
}
