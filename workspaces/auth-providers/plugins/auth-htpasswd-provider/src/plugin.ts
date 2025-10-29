import {
  ApiRef,
  BackstageIdentityApi,
  createApiRef,
  createPlugin,
  ProfileInfoApi,
  SessionApi,
} from '@backstage/core-plugin-api';

/**
 * @public
 */
export const authHtpasswdProviderPlugin = createPlugin({
  id: 'auth-htpasswd-provider',
});

/**
 * @public
 */
export const authHtpasswdApiRef: ApiRef<
  BackstageIdentityApi & ProfileInfoApi & SessionApi
> = createApiRef({
  id: 'auth-htpasswd-provider',
});
