import { startTestBackend } from '@backstage/backend-test-utils';

import { githubNotificationsPlugin } from './plugin';

// TEMPLATE NOTE:
// Plugin tests are integration tests for your plugin, ensuring that all pieces
// work together end-to-end. You can still mock injected backend services
// however, just like anyone who installs your plugin might replace the
// services with their own implementations.
describe('plugin', () => {
  it('should start test server', async () => {
    /*const { server } =*/ await startTestBackend({
      features: [githubNotificationsPlugin],
    });
  });
});
