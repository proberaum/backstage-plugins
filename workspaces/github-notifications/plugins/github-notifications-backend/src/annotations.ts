export enum NotificationsGitHubAnnotation {
  // https://github.com/search?q=repo%3Abackstage%2Fcommunity-plugins%20github.com%2Fproject-slug&type=code
  PROJECT_SLUG = 'github.com/project-slug',

  NOTIFY_ON_ISSUES = 'github.com/notify-on-issues',
  SEVERITY = 'github.com/notify-severity',
  TOPIC = 'github.com/notify-topic',

  SUBJECT_FILTER = 'github.com/notify-subject-filter',
  LABEL_FILTER = 'github.com/notify-label-filter',
}
