import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { HttpAuthService, LoggerService, RootConfigService, UserInfoService } from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';
import { Dashboard } from '../../../dashboards-common/src';

export interface RouterOptions {
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
  config: RootConfigService;
  logger: LoggerService;
}

export async function createRouter(options: RouterOptions): Promise<express.Router> {
  const { httpAuth, userInfo, config, logger } = options;

  const router = Router();
  router.use(express.json());

  router.get('/dashboards', async (req, res) => {
    const credentials = await httpAuth.credentials(req, {
      // This rejects request from non-users. Only use this if your plugin needs to access the
      // user identity, most of the time it's enough to just call `httpAuth.credentials(req)`
      allow: ['user'],
    });

    const user = await userInfo.getUserInfo(credentials);

    const dashboards: Dashboard[] = [
      {
        name: 'current-user',
        title: user.userEntityRef,
      },
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

    res.json(dashboards);
  });

  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
