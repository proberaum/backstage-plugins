# 🧪 Proberaum* for Backstage Plugins

*German for rehearsal room

This repo contains multiple early-stage Backstage plugins. The processes, tooling, and workflows are based on those in [backstage/community-plugins](https://github.com/backstage/community-plugins). Thanks to the Backstage Community, Spotify and Red Hat for making this setup public.

## [📚 Assets Plugin](workspaces/assets/README.md)

An asset / inventory plugin that allows you to save physical items and their locations in the Backstage ~~Software~~ Catalog.

From personal belongings, over your shared hardware resources, up to a data center, maybe...

## New workspace

0. Define workspace name

   ```
   export BACKSTAGE_APP_NAME=example
   ```

1. Create workspace:

   ```
   npx @backstage/create-app --path workspaces/$BACKSTAGE_APP_NAME --template-path=../../backstage/community-plugins/workspaces/repo-tools/packages/cli/src/lib/workspaces/templates/workspace --skip-install
   ```

   Commit.

2. Add backstage app:

   ```
   npx @backstage/create-app --skip-install
   
   mv $BACKSTAGE_APP_NAME/.gitignore $BACKSTAGE_APP_NAME/app-config.local.yaml $BACKSTAGE_APP_NAME/app-config.production.yaml $BACKSTAGE_APP_NAME/app-config.yaml $BACKSTAGE_APP_NAME/backstage.json $BACKSTAGE_APP_NAME/examples $BACKSTAGE_APP_NAME/packages workspaces/$BACKSTAGE_APP_NAME/

   rm $BACKSTAGE_APP_NAME/.dockerignore $BACKSTAGE_APP_NAME/.eslintignore $BACKSTAGE_APP_NAME/.eslintrc.js $BACKSTAGE_APP_NAME/.prettierignore $BACKSTAGE_APP_NAME/.yarnrc.yml $BACKSTAGE_APP_NAME/README.md $BACKSTAGE_APP_NAME/tsconfig.json

   rm -rf $BACKSTAGE_APP_NAME/.yarn $BACKSTAGE_APP_NAME/plugins
   ```

   Commit.

3. Install/update yarn.lock

   ```
   cd workspaces/$BACKSTAGE_APP_NAME
   yarn
   ```

   Commit.
