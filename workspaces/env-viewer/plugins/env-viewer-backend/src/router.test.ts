import {
  // mockCredentials,
  mockErrorHandler,
  // mockServices,
} from '@backstage/backend-test-utils';
import express from 'express';
import request from 'supertest';

import { createRouter } from './router';

describe('createRouter', () => {
  let app: express.Express;

  beforeEach(async () => {
    const router = await createRouter({
      config: {
        dangerouslyAnyoneCanReadAllEnvVars: true,
      },
      // httpAuth: mockServices.httpAuth(),
    });
    app = express();
    app.use(router);
    app.use(mockErrorHandler());
  });

  it('should get system envvars', async () => {
    const response = await request(app).get('/envvars').send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual(process.env);
  });
});
