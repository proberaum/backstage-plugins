# @proberaum/backstage-plugin-notifications-backend-module-github-issues

The `notifications-backend-module-github-issues` is a Backstage backend plugin module that enables automated notifications for new GitHub issues related to catalog entities. It integrates with Backstage's notification system and catalog, allowing entities to specify GitHub repositories and notification preferences via annotations.

## Features

- Periodically checks for new GitHub issues for catalog entities with the required annotations.
- Sends notifications to entity owners, users, or groups as specified in the entity's annotations.
- The notification includes details such as title, description, link, severity, topic, and icon.
- Uses Backstage's scheduler, catalog, and notification services for integration.

## Usage

Add the following annotations to your catalog entities:

- `github.com/project-slug`: The GitHub repository slug (e.g., `owner/repo`).
- `github.com/notify-on-issues`: Comma-separated list of receivers (`owner`, `user:username`, `group:groupname`).

Example:

```yaml
metadata:
  annotations:
    github.com/project-slug: backstage/community-plugins
    github.com/notify-on-issues: owner, user:alice, group:devs
```

- You can extend the module to filter issues by subject or label using additional annotations:

  - `github.com/notify-subject-filter`
  - `github.com/notify-label-filter`
