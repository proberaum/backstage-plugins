#!/bin/bash

find . -name node_modules | xargs rm -rf && yarn

for workspace in \
    analytics \
    assets \
    config-viewer \
    dashboards \
    env-viewer \
    github-notifications \
    icon-viewer \
    planning-poker \
    scheduler-notifications; \
do
    echo "update workspace $workspace..."
    cd workspaces/$workspace

    yarn
    yarn backstage-cli versions:bump
    yarn dedupe
    # yarn upgrade-interactive

    cd -
done

