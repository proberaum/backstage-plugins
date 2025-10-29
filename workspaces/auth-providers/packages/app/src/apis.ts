import { UserEntity } from '@backstage/catalog-model';
// import { openLoginPopup, AuthConnector } from '@backstage/core-app-api';
import {
  AnyApiFactory,
  ApiRef,
  AuthRequestOptions,
  BackstageIdentityApi,
  BackstageIdentityResponse,
  configApiRef,
  createApiFactory,
  createApiRef,
  DiscoveryApi,
  discoveryApiRef,
  ProfileInfo,
  ProfileInfoApi,
  SessionApi,
  SessionState,
} from '@backstage/core-plugin-api';
import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import { Observable } from '@backstage/types';

export const customAuthApiRef: ApiRef<
  ProfileInfoApi & BackstageIdentityApi & SessionApi
> = createApiRef({
  id: 'auth.my-custom-provider',
});

class CustomAuthApi
  implements ProfileInfoApi, BackstageIdentityApi, SessionApi
{
  private providerId = 'htpasswd';
  private discoveryApi: DiscoveryApi;

  private entity: UserEntity | undefined;
  private backstageIdentity: BackstageIdentityResponse | undefined;

  constructor({ discoveryApi }: { discoveryApi: DiscoveryApi }) {
    this.discoveryApi = discoveryApi;
  }

  async getProfile(
    options?: AuthRequestOptions,
  ): Promise<ProfileInfo | undefined> {
    console.log('xxx CustomAuthApi getProfile', options);
    if (!this.backstageIdentity) {
      return undefined;
    }
    return {
      displayName: this.entity?.spec.profile?.displayName,
      email: this.entity?.spec.profile?.email,
      picture: this.entity?.spec.profile?.picture,
    };
  }

  async getBackstageIdentity(
    options?: AuthRequestOptions,
  ): Promise<BackstageIdentityResponse | undefined> {
    if (this.backstageIdentity) {
      console.log(
        'xxx CustomAuthApi getBackstageIdentity return existing backstageIdentity',
        this.backstageIdentity,
      );
      return this.backstageIdentity;
    }

    if (options?.instantPopup) {
      console.log(
        'xxx CustomAuthApi getBackstageIdentity with instantPopup',
        options,
      );
      const baseUrl = await this.discoveryApi.getBaseUrl('auth');
      const startUrl = `${baseUrl}/${this.providerId}/start?env=development`;
      // const loginData = await openLoginPopup({
      //   name: 'htpasswd Login',
      //   url: startUrl,
      // });
      const loginData = await fetch(startUrl).then(response => response.json());
      console.log(
        'xxx CustomAuthApi getBackstageIdentity loginData',
        loginData,
      );
      this.entity = loginData.entity;
      this.backstageIdentity = loginData;
      return loginData;
    }

    console.log(
      'xxx CustomAuthApi getBackstageIdentity unknown options',
      options,
    );
    return undefined;
  }

  async signIn(): Promise<void> {
    console.log('xxx CustomAuthApi signIn');
  }

  async signOut(): Promise<void> {
    console.log('xxx CustomAuthApi signOut');
    this.backstageIdentity = undefined;
  }

  sessionState$(): Observable<SessionState> {
    console.log('xxx CustomAuthApi sessionState$');
    return {} as any;
  }
}

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: customAuthApiRef,
    deps: {
      discoveryApi: discoveryApiRef,
    },
    factory: ({ discoveryApi }) => {
      console.log('xxx create CustomAuthApi');
      return new CustomAuthApi({ discoveryApi });
    },
  }),

  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
];
