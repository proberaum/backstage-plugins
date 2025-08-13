# 🧪 Proberaum* for Backstage Plugins

*German for rehearsal room

This repo contains multiple early-stage Backstage plugins. The processes, tooling, and workflows are based on those in [backstage/community-plugins](https://github.com/backstage/community-plugins). Thanks to the Backstage Community, Spotify and Red Hat for making this setup public.

| Plugin | Description | Status |
| ------ | ----------- | ------ |
| [💻&nbsp;Analytics&nbsp;→&nbsp;Browser&nbsp;Log](workspaces/analytics/plugins/analytics-module-browser-log) | A AnalyticsApi implementation that sends all events to the Browser Log (console.log)<br/><br/>This for developer who like to debug the analytics events from their or other plugins. | Stable,&nbsp;but&nbsp;for&nbsp;Development |
| [📚&nbsp;Assets Catalog](workspaces/assets/README.md) | An asset or inventory plugin that allows you to save also **physical items and their locations** in the Backstage ~~Software~~ Catalog.<br/><br/>From personal belongings, over your company asset or hardware resources, up to a data center. | Preview, it contains just a catalog provider yet |
| [📊&nbsp;Dashboards](workspaces/dashboards) | Create and share Dashboards in Backstage | In progress |
| [📬&nbsp;GitHub&nbsp;Notifications](workspaces/notify/plugins/github-notifications-backend) | This is a backend plugin that enables automated notifications for **new and updated GitHub issues** related to catalog entities.<br/><br/>It integrates with Backstage notification system and catalog, allowing entities to specify GitHub repositories and notification preferences via annotations. | Production&nbsp;ready* |
| [🃏&nbsp;Planning&nbsp;Poker](workspaces/planning-poker) | A small Backstage plugin to do Planning Poker in Backstage | In progress |

*Production ready means anyway this plugin has no commerical or official support. Feel free to raise issues in this repository.
