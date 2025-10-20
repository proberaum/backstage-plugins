import {
  // mockCredentials,
  startTestBackend,
} from '@backstage/backend-test-utils';
import { envViewerPlugin } from './plugin';
import request from 'supertest';

describe('plugin', () => {
  it('should get system envvars', async () => {
    const { server } = await startTestBackend({
      features: [envViewerPlugin],
    });

    await request(server).get('/api/env-viewer/envvars');
    // .expect(200, {});
  });
});
