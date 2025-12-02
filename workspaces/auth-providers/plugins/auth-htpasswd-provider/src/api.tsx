import { createRoot } from 'react-dom/client';

import { UserEntity } from '@backstage/catalog-model';
// import { openLoginPopup, AuthConnector } from '@backstage/core-app-api';
import {
  AuthRequestOptions,
  BackstageIdentityApi,
  BackstageIdentityResponse,
  DiscoveryApi,
  ProfileInfo,
  ProfileInfoApi,
  SessionApi,
  SessionState,
} from '@backstage/core-plugin-api';
import { Observable } from '@backstage/types';

import { LoginDialog } from './components/LoginDialog';

/**
 * @public
 */
export class HtpasswdAuthApi
  implements BackstageIdentityApi, ProfileInfoApi, SessionApi
{
  private providerId = 'htpasswd';
  private discoveryApi: DiscoveryApi;

  private entity: UserEntity | undefined;
  private backstageIdentity: BackstageIdentityResponse | undefined;

  constructor({ discoveryApi }: { discoveryApi: DiscoveryApi }) {
    this.discoveryApi = discoveryApi;
  }

  async getBackstageIdentity(
    options?: AuthRequestOptions,
  ): Promise<BackstageIdentityResponse | undefined> {
    if (this.backstageIdentity) {
      console.log(
        'xxx HtpasswdAuthApi getBackstageIdentity return existing backstageIdentity',
        this.backstageIdentity,
      );
      return this.backstageIdentity;
    }

    return new Promise((resolve, _reject) => {
      const div = document.createElement('div');
      document.body.appendChild(div)
      const root = createRoot(div);

      const handleLogin = async () => {
        console.log(
          'xxx HtpasswdAuthApi handle login',
        );
        try {
          const baseUrl = await this.discoveryApi.getBaseUrl('auth');
          const startUrl = `${baseUrl}/${this.providerId}/start?env=development`;
          // const loginData = await openLoginPopup({
          //   name: 'htpasswd Login',
          //   url: startUrl,
          // });
          const loginData = await fetch(startUrl).then(response => response.json());
          console.log(
            'xxx HtpasswdAuthApi getBackstageIdentity loginData',
            loginData,
          );
          this.entity = loginData.entity;
          this.backstageIdentity = loginData;

          root.unmount();
          document.body.removeChild(div);
          resolve(loginData);
        } catch (error) {
          console.log('xxx error', error);
        }
      };

      const handleClose = () => {
        root.unmount();
        document.body.removeChild(div);
        resolve(undefined);
      };

      root.render(
        <LoginDialog
          onLogin={handleLogin}
          onClose={handleClose}
        />
      );
    });

    if (options?.instantPopup) {
      console.log(
        'xxx HtpasswdAuthApi getBackstageIdentity with instantPopup',
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
        'xxx HtpasswdAuthApi getBackstageIdentity loginData',
        loginData,
      );
      this.entity = loginData.entity;
      this.backstageIdentity = loginData;
      return loginData;
    }

    console.log(
      'xxx HtpasswdAuthApi getBackstageIdentity unknown options',
      options,
    );
    return undefined;
  }

  async getProfile(
    options?: AuthRequestOptions,
  ): Promise<ProfileInfo | undefined> {
    console.log('xxx HtpasswdAuthApi getProfile', options);
    if (!this.backstageIdentity) {
      return undefined;
    }
    return {
      displayName: this.entity?.spec.profile?.displayName,
      email: this.entity?.spec.profile?.email,
      picture: this.entity?.spec.profile?.picture,
    };
  }

  async signIn(): Promise<void> {
    console.log('xxx HtpasswdAuthApi signIn');
  }

  async signOut(): Promise<void> {
    console.log('xxx HtpasswdAuthApi signOut');
    this.backstageIdentity = undefined;
  }

  sessionState$(): Observable<SessionState> {
    console.log('xxx HtpasswdAuthApi sessionState$');
    return {} as any;
  }
}
