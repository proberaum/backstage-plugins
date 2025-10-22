// import { HttpAuthService } from '@backstage/backend-plugin-api';
import { NotAllowedError, InputError } from '@backstage/errors';

import express from 'express';
import Router from 'express-promise-router';

import { glob } from 'glob';

import { ConfigViewerConfig } from '../config';

const getFiles = async (config: ConfigViewerConfig) => {
  if (!config.dangerouslyAnyoneCanReadAllTheFiles) {
    throw new NotAllowedError();
  }
  const resolvedFiles = await glob(config.files, {
    cwd: config.workingDirectory,
    ignore: config.ignore,
    nodir: true,
  });
  return resolvedFiles;
};

export async function createRouter({
  config,
}: // httpAuth,
{
  config: ConfigViewerConfig;
  // httpAuth: HttpAuthService;
}): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.get('/files', async (_req, res) => {
    const resolvedFiles = await getFiles(config);
    resolvedFiles.sort();
    res.json(resolvedFiles);
  });

  router.get('/content', async (req, res) => {
    const filename = req.query['filename'];
    if (!filename || typeof filename !== 'string') {
      throw new InputError();
    }
    const resolvedFiles = await getFiles(config);
    if (!resolvedFiles.includes(filename)) {
      throw new NotAllowedError();
    }
    res.sendFile(filename, {
      root: config.workingDirectory,
      index: false,
    });
  });

  return router;
}
