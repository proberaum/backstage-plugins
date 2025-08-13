# How to create a new workspace with Backstage App

1. Define workspace name

   ```sh
   export BACKSTAGE_APP_NAME=example
   ```

2. Create workspace:

   ```sh
   npx @backstage/create-app --path workspaces/$BACKSTAGE_APP_NAME --template-path=../../backstage/community-plugins/workspaces/repo-tools/packages/cli/src/lib/workspaces/templates/workspace --skip-install

   cd workspaces/$BACKSTAGE_APP_NAME
   yarn
   cd ../..

   git add workspaces/$BACKSTAGE_APP_NAME

   git commit -m "chore($BACKSTAGE_APP_NAME): create new workspace" --signoff
   ```

3. Add backstage app:

   ```sh
   npx @backstage/create-app --skip-install
   
   mv $BACKSTAGE_APP_NAME/.gitignore $BACKSTAGE_APP_NAME/app-config.local.yaml $BACKSTAGE_APP_NAME/app-config.production.yaml $BACKSTAGE_APP_NAME/app-config.yaml $BACKSTAGE_APP_NAME/backstage.json $BACKSTAGE_APP_NAME/catalog-info.yaml $BACKSTAGE_APP_NAME/examples $BACKSTAGE_APP_NAME/packages workspaces/$BACKSTAGE_APP_NAME/

   rm $BACKSTAGE_APP_NAME/.dockerignore $BACKSTAGE_APP_NAME/.eslintignore $BACKSTAGE_APP_NAME/.eslintrc.js $BACKSTAGE_APP_NAME/.prettierignore $BACKSTAGE_APP_NAME/.yarnrc.yml $BACKSTAGE_APP_NAME/README.md $BACKSTAGE_APP_NAME/tsconfig.json

   rm -rf $BACKSTAGE_APP_NAME/.yarn $BACKSTAGE_APP_NAME/plugins

   cd workspaces/$BACKSTAGE_APP_NAME
   yarn
   cd ../..

   git add workspaces/$BACKSTAGE_APP_NAME

   git commit -m "chore($BACKSTAGE_APP_NAME): create new workspace app" --signoff
   ```
