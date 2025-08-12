# GitHub Notifications Backend

This is a Backstage backend plugin that enables automated notifications for **new and updated GitHub issues** related to catalog entities. It integrates with Backstage notification system and catalog, allowing entities to specify GitHub repositories and notification preferences via annotations.

## Features

- Periodically checks for new and updated GitHub issues
- Sends notifications to entity owners, users, or groups as specified in the entity's annotations
- The notification includes the repo and issue number, title, link, severity, and a GitHub icon
- Notifications are grouped by a topic

## Not yet implemented (contributions are welcome!)

- Configuration option for the scheduler (currently it runs every 10 minutes)
- Notifications for PRs
- Support for on-prem GitHub instances

## Usage

Add the following annotations to your catalog entities:

- `github.com/project-slug`: The GitHub repository slug (e.g., `owner/repo`).
- `github.com/notify-on-issues`: Comma-separated list of receivers (`owner`, `user:username`, `group:groupname`).

  Example:

  ```yaml
  metadata:
    annotations:
      github.com/project-slug: org/repo
      github.com/notify-on-issues: owner, user:alice, group:devs
  ```

- `github.com/notify-topic`: topic for the notification. If not specified the entity title or name is used as fallback
- `github.com/notify-severity`: specify the notification severity. Valid values: critical, high, normal (default), or low
- `github.com/notify-subject-filter`: Comma-separated list of keywords that must be included in the issue
- `github.com/notify-label-filter`: Comma-separated list of labels that must be assigned to the issue

  When both filters are defined, notifications are generated when one of both matches.

More examples:

```yaml
---
# https://backstage.io/docs/features/software-catalog/descriptor-format#kind-component
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: backstage-catalog
  annotations:
    github.com/project-slug: backstage/backstage
    github.com/notify-on-issues: group:development/backstage-catalog-interested-people
    github.com/notify-topic: Backstage Catalog
    github.com/notify-subject-filter: catalog
    github.com/notify-label-filter: area:catalog
spec:
  type: plugin
  lifecycle: experimental
  owner: backstage-team
---
# https://backstage.io/docs/features/software-catalog/descriptor-format#kind-component
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: backstage-scaffolder
  annotations:
    github.com/project-slug: backstage/backstage
    github.com/notify-on-issues: group:development/backstage-scaffolder-interested-people
    github.com/notify-topic: Backstage Scaffolder
    github.com/notify-subject-filter: scaffolder
    github.com/notify-label-filter: area:scaffolder
spec:
  type: plugin
  lifecycle: experimental
  owner: backstage-team
---
# https://backstage.io/docs/features/software-catalog/descriptor-format#kind-component
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: rbac-plugin
  annotations:
    github.com/project-slug: backstage/community-plugins
    github.com/notify-on-issues: group:development/rbac-plugin-team
    github.com/notify-topic: RBAC Plugin
    github.com/notify-subject-filter: RBAC
spec:
  type: plugin
  lifecycle: experimental
  owner: development/rbac-plugin-team
---
# https://backstage.io/docs/features/software-catalog/descriptor-format#kind-component
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: servicenow-plugin
  annotations:
    github.com/project-slug: backstage/community-plugins
    github.com/notify-on-issues: owner
    github.com/notify-topic: ServiceNow Plugin
    github.com/notify-subject-filter: ServiceNow
spec:
  type: plugin
  lifecycle: experimental
  owner: development/servicenow-plugin-team
---
# https://backstage.io/docs/features/software-catalog/descriptor-format#kind-component
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: proberaum
  annotations:
    github.com/project-slug: proberaum/backstage-plugins
    github.com/notify-on-issues: group:development/proberaum-interested-people
    github.com/notify-topic: Proberaum
spec:
  type: plugin
  lifecycle: experimental
  owner: user:development/guest
```

## Installation

This plugin is installed via the `@proberaum/backstage-plugin-github-notifications-backend` package.

To install it to your backend package, run the following command:

```bash
# From your root directory
yarn --cwd packages/backend add @proberaum/backstage-plugin-github-notifications-backend
```

Then add the plugin to your backend in `packages/backend/src/index.ts`:

```ts
const backend = createBackend();
// ...
backend.add(import('@proberaum/backstage-plugin-github-notifications-backend'));
```

## Development

This plugin backend can be started in a standalone mode from directly in this
package with `yarn start`. It is a limited setup that is most convenient when
developing the plugin backend itself.

If you want to run the entire project, including the frontend, run `yarn start` from the root directory.
