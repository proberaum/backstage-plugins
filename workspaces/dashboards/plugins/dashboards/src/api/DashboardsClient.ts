import { DiscoveryApi, FetchApi } from "@backstage/core-plugin-api";
import { ResponseError } from '@backstage/errors';
import { Dashboard } from "../../../dashboards-common/src";
import { DashboardsApi } from "./DashboardsApi";

interface DashboardsClientDeps {
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
}

export class DashboardsClient implements DashboardsApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(deps: DashboardsClientDeps) {
    this.discoveryApi = deps.discoveryApi;
    this.fetchApi = deps.fetchApi;
  }

  private async get(path: string): Promise<any> {
    const baseUrl = await this.discoveryApi.getBaseUrl('dashboards');
    const response = await this.fetchApi.fetch(`${baseUrl}/${path}`);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json();
  }

  async getDashboards(): Promise<Dashboard[]> {
    return this.get('dashboards');
  }

  async getDashboard(name: string): Promise<Dashboard> {
    return this.get(`dashboards/${name}`);
  }
}
