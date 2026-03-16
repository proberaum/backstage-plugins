import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';
import {
  HcloudServerDetails,
  HcloudMetricType,
  HcloudTimeRange,
  HcloudMetricsResponse,
} from '@proberaum/backstage-plugin-hcloud-common';
import { ResponseError } from '@backstage/errors';

export interface HcloudApi {
  getServer(ref: string, project?: string): Promise<HcloudServerDetails>;
  getServerMetrics(
    ref: string,
    type: HcloudMetricType,
    range: HcloudTimeRange,
    project?: string,
  ): Promise<HcloudMetricsResponse>;
}

export const hcloudApiRef = createApiRef<HcloudApi>({
  id: 'plugin.hcloud',
});

export class HcloudApiClient implements HcloudApi {
  readonly #discoveryApi: DiscoveryApi;
  readonly #fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.#discoveryApi = options.discoveryApi;
    this.#fetchApi = options.fetchApi;
  }

  async getServer(ref: string, project?: string): Promise<HcloudServerDetails> {
    const baseUrl = await this.#discoveryApi.getBaseUrl('hcloud');
    const query = project ? `?project=${encodeURIComponent(project)}` : '';
    const url = `${baseUrl}/servers/${encodeURIComponent(ref)}${query}`;

    const response = await this.#fetchApi.fetch(url);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json();
  }

  async getServerMetrics(
    ref: string,
    type: HcloudMetricType,
    range: HcloudTimeRange,
    project?: string,
  ): Promise<HcloudMetricsResponse> {
    const baseUrl = await this.#discoveryApi.getBaseUrl('hcloud');
    const params = new URLSearchParams({ type, range });
    if (project) {
      params.set('project', project);
    }
    const url = `${baseUrl}/servers/${encodeURIComponent(
      ref,
    )}/metrics?${params}`;

    const response = await this.#fetchApi.fetch(url);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json();
  }
}
