import {
  coreServices,
  createBackendModule,
  LoggerService,
} from '@backstage/backend-plugin-api';
import {
  AuthProviderRouteHandlers,
  authProvidersExtensionPoint,
  AuthResolverContext,
} from '@backstage/plugin-auth-node';

class HtpasswdAuthProvider implements AuthProviderRouteHandlers {
  private logger: LoggerService;
  private resolverContext: AuthResolverContext;

  constructor({
    logger,
    resolverContext,
  }: {
    logger: LoggerService;
    resolverContext: AuthResolverContext;
  }) {
    this.logger = logger;
    this.resolverContext = resolverContext;
  }

  async start(_req: any, res: any): Promise<void> {
    this.logger.warn('xxx HtpasswdAuthProvider start');

    const { entity } = await this.resolverContext.findCatalogUser({
      entityRef: {
        name: 'guest',
      },
    });
    this.logger.warn('xxx HtpasswdAuthProvider start entity', entity);

    const signin1 = await this.resolverContext.signInWithCatalogUser({
      entityRef: {
        name: 'guest',
      },
    });
    this.logger.warn('xxx HtpasswdAuthProvider start signin1', {
      token: signin1.token,
      identity: signin1.identity,
    });

    const signin2 = await this.resolverContext.issueToken({
      claims: {
        sub: 'user:default/guest2',
        name: 'oh',
        displayName: 'no',
      },
    });
    this.logger.warn('xxx HtpasswdAuthProvider start signin2', {
      token: signin2.token,
      identity: signin2.identity,
    });

    res.status(200).json({ entity, ...signin1 });
  }

  async frameHandler(_req: any, _res: any): Promise<void> {
    this.logger.warn('xxx HtpasswdAuthProvider frameHandler');
  }

  async refresh(_req: any, _res: any): Promise<void> {
    this.logger.warn('xxx HtpasswdAuthProvider refresh');
  }

  async logout(_req: any, _res: any): Promise<void> {
    this.logger.warn('xxx HtpasswdAuthProvider logout');
  }
}

/**
 * @public
 */
export const authModuleHtpasswdProvider = createBackendModule({
  pluginId: 'auth',
  moduleId: 'htpasswd-provider',
  register(reg) {
    reg.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        authProviders: authProvidersExtensionPoint,
      },
      async init({ /*config,*/ logger, authProviders }) {
        logger.info('Hello World!');

        authProviders.registerProvider({
          providerId: 'htpasswd',
          factory: ({
            logger,
            resolverContext,
            baseUrl,
            appUrl,
            cookieConfigurer,
          }) => {
            logger.info('log something...');
            console.log('xxx authProviders factory logger', logger);
            console.log(
              'xxx authProviders factory resolverContext',
              resolverContext,
            );
            console.log('xxx authProviders factory baseUrl', baseUrl);
            console.log('xxx authProviders factory appUrl', appUrl);
            console.log(
              'xxx authProviders factory cookieConfigurer',
              cookieConfigurer,
            );
            return new HtpasswdAuthProvider({ logger, resolverContext });
          },
        });
      },
    });
  },
});
