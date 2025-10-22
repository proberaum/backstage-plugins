import {
  mockCredentials,
  mockErrorHandler,
  // mockServices,
} from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';

import { createRouter } from './router';

describe('createRouter', () => {
  let app: express.Express;

  it('should return files', async () => {
    const router = await createRouter({
      config: {
        dangerouslyAnyoneCanReadAllTheFiles: true,
        files: ['app-config.yaml', 'app-config.prod*.yaml'],
      },
      // httpAuth: mockServices.httpAuth(),
    });
    app = express();
    app.use(router);
    app.use(mockErrorHandler());

    const response = await request(app)
      .get('/files')
      .set('Authorization', mockCredentials.none.header());

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      'app-config.production.yaml',
      'app-config.yaml',
    ]);
  });
});
