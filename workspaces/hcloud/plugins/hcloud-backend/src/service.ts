import {
  coreServices,
  createServiceFactory,
  createServiceRef,
  LoggerService,
  CacheService,
} from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import { JsonValue } from '@backstage/types';
import {
  HcloudServerDetails,
  HcloudMetricType,
  HcloudTimeRange,
  HcloudMetricsResponse,
} from '@proberaum/backstage-plugin-hcloud-common';
import { HcloudClient } from './client';
import { readHcloudConfig, HcloudConfig } from './config';

export interface HcloudService {
  getServer(ref: string, project?: string): Promise<HcloudServerDetails>;
  getServerMetrics(
    ref: string,
    type: HcloudMetricType,
    range: HcloudTimeRange,
    project?: string,
  ): Promise<HcloudMetricsResponse>;
  listServers(project: string): Promise<HcloudServerDetails[]>;
  getProjectKeys(): string[];
}

export class DefaultHcloudService implements HcloudService {
  readonly #config: HcloudConfig;
  readonly #clients: Map<string, HcloudClient> = new Map();
  readonly #cache: CacheService;
  readonly #logger: LoggerService;

  constructor(options: {
    config: HcloudConfig;
    cache: CacheService;
    logger: LoggerService;
  }) {
    this.#config = options.config;
    this.#cache = options.cache;
    this.#logger = options.logger;
  }

  getProjectKeys(): string[] {
    return Object.keys(this.#config.projects);
  }

  async getServer(ref: string, project?: string): Promise<HcloudServerDetails> {
    const projectKey = this.#resolveProject(project);
    const cacheKey = `server:${projectKey}:${ref}`;
    const cached = await this.#cache.get<JsonValue>(cacheKey);
    if (cached) {
      return cached as unknown as HcloudServerDetails;
    }
    const client = this.#getClient(projectKey);
    const server = await client.getServer(ref);
    await this.#cache.set(cacheKey, server as unknown as JsonValue, {
      ttl: this.#config.cache.ttl * 1000,
    });
    return server;
  }

  async getServerMetrics(
    ref: string,
    type: HcloudMetricType,
    range: HcloudTimeRange,
    project?: string,
  ): Promise<HcloudMetricsResponse> {
    const server = await this.getServer(ref, project);
    const projectKey = this.#resolveProject(project);
    const cacheKey = `metrics:${projectKey}:${server.id}:${type}:${range}`;
    const cached = await this.#cache.get<JsonValue>(cacheKey);
    if (cached) {
      return cached as unknown as HcloudMetricsResponse;
    }
    const client = this.#getClient(projectKey);
    const metrics = await client.getServerMetrics(server.id, type, range);
    await this.#cache.set(cacheKey, metrics as unknown as JsonValue, {
      ttl: this.#config.cache.metricsTtl * 1000,
    });
    return metrics;
  }

  async listServers(project: string): Promise<HcloudServerDetails[]> {
    const projectKey = this.#resolveProject(project);
    const client = this.#getClient(projectKey);
    return client.listServers();
  }

  #resolveProject(project?: string): string {
    const key = project ?? this.#config.defaultProject;
    if (!this.#config.projects[key]) {
      throw new InputError(
        `Unknown hcloud project "${key}". Valid projects: ${Object.keys(this.#config.projects).join(', ')}`,
      );
    }
    return key;
  }

  #getClient(project: string): HcloudClient {
    let client = this.#clients.get(project);
    if (!client) {
      this.#logger.info(`Creating hcloud client for project "${project}"`);
      client = new HcloudClient(this.#config.projects[project].token);
      this.#clients.set(project, client);
    }
    return client;
  }
}

export const hcloudServiceRef = createServiceRef<HcloudService>({
  id: 'hcloud.service',
  defaultFactory: async service =>
    createServiceFactory({
      service,
      deps: {
        config: coreServices.rootConfig,
        cache: coreServices.cache,
        logger: coreServices.logger,
      },
      async factory({ config, cache, logger }) {
        const hcloudConfig = readHcloudConfig(config);
        return new DefaultHcloudService({
          config: hcloudConfig,
          cache,
          logger,
        });
      },
    }),
});
