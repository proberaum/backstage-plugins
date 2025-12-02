import { authHtpasswdProviderPlugin } from './plugin';

describe('auth-htpasswd-provider', () => {
  it('should export plugin', () => {
    expect(authHtpasswdProviderPlugin).toBeDefined();
  });
});
