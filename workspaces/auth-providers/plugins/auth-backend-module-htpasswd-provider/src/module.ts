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

class CustomAuthProvider implements AuthProviderRouteHandlers {
  private logger: LoggerService;
  private resolverContext: AuthResolverContext;
  private baseUrl: string;
  private appUrl: string;

  constructor({ logger, resolverContext, baseUrl, appUrl }: { logger: LoggerService, resolverContext: AuthResolverContext, baseUrl: string, appUrl: string }) {
    this.logger = logger;
    this.resolverContext = resolverContext;
    this.baseUrl = baseUrl;
    this.appUrl = appUrl;
  }

  async start(req: any, res: any): Promise<void> {
    console.log('xxx CustomAuthProvider start');

    const { entity } = await this.resolverContext.findCatalogUser({
      entityRef: {
        name: 'guest',
      },
    });
    console.log('xxx CustomAuthProvider start entity', entity);

    const signin1 = await this.resolverContext.signInWithCatalogUser({
      entityRef: {
        name: 'guest',
      },
    });
    console.log('xxx CustomAuthProvider start signin1', signin1);

    const signin2 = await this.resolverContext.issueToken({
      claims: {
        sub: 'user:default/guest2',
        name: 'oh',
        displayName: 'no',
      },
    });
    console.log('xxx CustomAuthProvider start signin2', signin2);

    res.status(200).json({ entity, ...signin1 });
  }

  async frameHandler(req: any, res: any): Promise<void> {
    console.log('xxx CustomAuthProvider frameHandler');
  }

  async refresh(req: any, res: any): Promise<void> {
    console.log('xxx CustomAuthProvider refresh');
  }

  async logout(req: any, res: any): Promise<void> {
    console.log('xxx CustomAuthProvider logout');
  }
};

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
          factory: ({ logger, resolverContext, baseUrl, appUrl, cookieConfigurer }) => {
            logger.info('log something...');
            console.log('xxx authProviders factory logger', logger);
            console.log('xxx authProviders factory resolverContext', resolverContext);
            console.log('xxx authProviders factory baseUrl', baseUrl);
            console.log('xxx authProviders factory appUrl', appUrl);
            console.log('xxx authProviders factory cookieConfigurer', cookieConfigurer);
            return new CustomAuthProvider({ logger, resolverContext, baseUrl, appUrl });
          },
        })
      },
    });
  },
});
