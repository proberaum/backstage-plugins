import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import { configViewerPlugin } from './plugin';
import request from 'supertest';

describe('plugin', () => {
  it('should return files', async () => {
    const { server } = await startTestBackend({
      features: [
        mockServices.rootConfig.factory({
          data: {
            configViewer: {
              dangerouslyAnyoneCanReadAllTheFiles: true,
              files: ['app-config.yaml', 'app-config.prod*.yaml'],
            },
          },
        }),
        configViewerPlugin,
      ],
    });

    const response = await request(server).get('/api/config-viewer/files');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      'app-config.production.yaml',
      'app-config.yaml',
    ]);
  });
});
