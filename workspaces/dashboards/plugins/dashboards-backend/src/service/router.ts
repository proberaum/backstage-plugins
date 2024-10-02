import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { LoggerService, RootConfigService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { Dashboard } from '../../../dashboards-common/src';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(express.json());

  router.get('/dashboards', (_, response) => {
    const dashboards: Dashboard[] = [
      {
        name: 'test-1',
        title: 'Test 1',
      },
      {
        name: 'test-2',
        title: 'Test 2',
      },
      {
        name: 'test-3',
        title: 'Test 3',
      },
    ];
    response.json({
      items: dashboards,
    });
  });

  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
