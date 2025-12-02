import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import { authHtpasswdApiRef, HtpasswdAuthApi } from '@proberaum/backstage-plugin-auth-htpasswd-provider';

export const apis: AnyApiFactory[] = [
  // TODO: This should be done in the plugin itself?!
  createApiFactory({
    api: authHtpasswdApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
    },
    factory: ({ discoveryApi }) => {
      console.log('xxx create HtpasswdAuthApi');
      return new HtpasswdAuthApi({ discoveryApi });
    },
  }),

  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
];
