// import { HttpAuthService } from '@backstage/backend-plugin-api';
import { NotAllowedError } from '@backstage/errors';

import express from 'express';
import Router from 'express-promise-router';

import { EnvViewerConfig } from '../config';

export async function createRouter({
  config,
}: // httpAuth,
{
  config: EnvViewerConfig;
  // httpAuth: HttpAuthService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.get('/envvars', async (_req, res) => {
    if (!config.dangerouslyAnyoneCanReadAllEnvVars) {
      throw new NotAllowedError();
    }
    res.json(process.env);
  });

  return router;
}
