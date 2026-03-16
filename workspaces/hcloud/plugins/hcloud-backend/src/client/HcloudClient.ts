import fetch from 'node-fetch';
import { NotFoundError } from '@backstage/errors';
import {
  isServerId,
  HcloudServerStatus,
  HcloudServerDetails,
  HcloudMetricType,
  HcloudTimeRange,
  HcloudMetricsResponse,
  HcloudTimeSeries,
  HcloudVolume,
} from '@proberaum/backstage-plugin-hcloud-common';

const HCLOUD_API_BASE = 'https://api.hetzner.cloud/v1';

const RANGE_PARAMS: Record<
  HcloudTimeRange,
  { offsetMs: number; step: number }
> = {
  '1h': { offsetMs: 60 * 60 * 1000, step: 60 },
  '6h': { offsetMs: 6 * 60 * 60 * 1000, step: 300 },
  '24h': { offsetMs: 24 * 60 * 60 * 1000, step: 900 },
  '7d': { offsetMs: 7 * 24 * 60 * 60 * 1000, step: 3600 },
  '30d': { offsetMs: 30 * 24 * 60 * 60 * 1000, step: 14400 },
};

export class HcloudClient {
  readonly #token: string;

  constructor(token: string) {
    this.#token = token;
  }

  async getServerById(id: number): Promise<HcloudServerDetails> {
    const data = await this.#request(`/servers/${id}`);
    return this.#mapServer(data.server);
  }

  async getServerByName(name: string): Promise<HcloudServerDetails> {
    const data = await this.#request(
      `/servers?name=${encodeURIComponent(name)}`,
    );
    const servers = data.servers;
    if (!servers || servers.length === 0) {
      throw new NotFoundError(`Server with name "${name}" not found`);
    }
    return this.#mapServer(servers[0]);
  }

  async getServer(ref: string): Promise<HcloudServerDetails> {
    if (isServerId(ref)) {
      return this.getServerById(Number(ref));
    }
    return this.getServerByName(ref);
  }

  async getServerMetrics(
    serverId: number,
    type: HcloudMetricType,
    range: HcloudTimeRange,
  ): Promise<HcloudMetricsResponse> {
    const params = RANGE_PARAMS[range];
    const end = new Date();
    const start = new Date(end.getTime() - params.offsetMs);

    const query = new URLSearchParams({
      type,
      start: start.toISOString(),
      end: end.toISOString(),
      step: String(params.step),
    });

    const data = await this.#request(
      `/servers/${serverId}/metrics?${query.toString()}`,
    );

    const timeSeries: HcloudTimeSeries[] = Object.entries(
      data.metrics.time_series as Record<
        string,
        { values: Array<[number, string]> }
      >,
    ).map(([name, series]) => ({
      name,
      values: series.values.map(([ts, val]) => ({
        timestamp: ts,
        value: parseFloat(val),
      })),
    }));

    return {
      type,
      range,
      start: start.toISOString(),
      end: end.toISOString(),
      step: params.step,
      timeSeries,
    };
  }

  async listServers(): Promise<HcloudServerDetails[]> {
    const allServers: HcloudServerDetails[] = [];
    let page = 1;

    while (true) {
      const data = await this.#request(`/servers?page=${page}&per_page=50`);
      for (const s of data.servers) {
        allServers.push(await this.#mapServer(s));
      }
      if (
        !data.meta?.pagination?.next_page ||
        data.meta.pagination.next_page <= page
      ) {
        break;
      }
      page = data.meta.pagination.next_page;
    }

    return allServers;
  }

  async #request(path: string): Promise<any> {
    const url = `${HCLOUD_API_BASE}${path}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.#token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const body = await response.text();
      if (response.status === 404) {
        throw new NotFoundError(`Hetzner Cloud API: ${body}`);
      }
      // Map auth errors to 502 per spec — no token leakage
      if (response.status === 401 || response.status === 403) {
        const error = new Error(
          'Hetzner Cloud API: invalid or expired API token',
        );
        (error as any).statusCode = 502;
        throw error;
      }
      const error = new Error(
        `Hetzner Cloud API error (${response.status}): ${body}`,
      );
      (error as any).statusCode = response.status;
      throw error;
    }

    return response.json();
  }

  async #mapServer(raw: any): Promise<HcloudServerDetails> {
    const volumes: HcloudVolume[] = [];
    if (raw.volumes && raw.volumes.length > 0) {
      for (const volId of raw.volumes) {
        try {
          const volData = await this.#request(`/volumes/${volId}`);
          const v = volData.volume;
          volumes.push({
            id: v.id,
            name: v.name,
            size: v.size,
            format: v.format,
            linux_device: v.linux_device,
          });
        } catch {
          volumes.push({
            id: volId,
            name: `volume-${volId}`,
            size: 0,
            format: null,
            linux_device: null,
          });
        }
      }
    }

    return {
      id: raw.id,
      name: raw.name,
      status: raw.status as HcloudServerStatus,
      server_type: {
        id: raw.server_type.id,
        name: raw.server_type.name,
        description: raw.server_type.description,
        cores: raw.server_type.cores,
        memory: raw.server_type.memory,
        disk: raw.server_type.disk,
      },
      datacenter: {
        id: raw.datacenter.id,
        name: raw.datacenter.name,
        description: raw.datacenter.description,
        location: {
          id: raw.datacenter.location.id,
          name: raw.datacenter.location.name,
          description: raw.datacenter.location.description,
          country: raw.datacenter.location.country,
          city: raw.datacenter.location.city,
        },
      },
      public_net: {
        ipv4: {
          ip: raw.public_net.ipv4?.ip ?? '',
          blocked: raw.public_net.ipv4?.blocked ?? false,
        },
        ipv6: {
          ip: raw.public_net.ipv6?.ip ?? '',
          blocked: raw.public_net.ipv6?.blocked ?? false,
        },
        floating_ips: raw.public_net.floating_ips ?? [],
        firewalls: raw.public_net.firewalls ?? [],
      },
      image: raw.image
        ? {
            id: raw.image.id,
            type: raw.image.type,
            name: raw.image.name,
            description: raw.image.description,
            created: raw.image.created,
          }
        : null,
      created: raw.created,
      labels: raw.labels ?? {},
      volumes,
      protection: {
        delete: raw.protection?.delete ?? false,
        rebuild: raw.protection?.rebuild ?? false,
      },
      backup_window: raw.backup_window ?? null,
      outgoing_traffic: raw.outgoing_traffic,
      ingoing_traffic: raw.ingoing_traffic,
      included_traffic: raw.included_traffic ?? 0,
      load_balancers: raw.load_balancers ?? [],
    };
  }
}
