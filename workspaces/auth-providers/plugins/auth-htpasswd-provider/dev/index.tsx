import { createDevApp } from '@backstage/dev-utils';
import { authHtpasswdProviderPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(authHtpasswdProviderPlugin)
  .render();
