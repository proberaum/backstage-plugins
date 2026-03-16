// plugins/hcloud-module-catalog/src/provider/HcloudEntityProvider.ts
import { Entity } from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { LoggerService, SchedulerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { HcloudService } from '@proberaum/backstage-plugin-hcloud-backend';
import {
  HCLOUD_SERVER_ANNOTATION,
  HCLOUD_PROJECT_ANNOTATION,
  HcloudServerDetails,
} from '@proberaum/backstage-plugin-hcloud-common';

interface ProviderConfig {
  projectKey: string;
  schedule: {
    frequency: { minutes: number };
    timeout: { minutes: number };
  };
  filters?: {
    labels?: Record<string, string>;
  };
  defaults: {
    owner: string;
    lifecycle: string;
  };
}

function readProviderConfigs(config: Config): ProviderConfig[] {
  const providersConfig = config.getOptionalConfig('catalog.providers.hcloud');
  if (!providersConfig) {
    return [];
  }

  return providersConfig.keys().map(key => {
    const providerConfig = providersConfig.getConfig(key);
    const scheduleConfig = providerConfig.getConfig('schedule');
    const filtersConfig = providerConfig.getOptionalConfig('filters');
    const defaultsConfig = providerConfig.getOptionalConfig('defaults');

    const labelsConfig = filtersConfig?.getOptionalConfig('labels');
    const labels: Record<string, string> = {};
    if (labelsConfig) {
      for (const labelKey of labelsConfig.keys()) {
        labels[labelKey] = labelsConfig.getString(labelKey);
      }
    }

    return {
      projectKey: key,
      schedule: {
        frequency: {
          minutes: scheduleConfig.getConfig('frequency').getNumber('minutes'),
        },
        timeout: {
          minutes: scheduleConfig.getConfig('timeout').getNumber('minutes'),
        },
      },
      filters: Object.keys(labels).length > 0 ? { labels } : undefined,
      defaults: {
        owner: defaultsConfig?.getOptionalString('owner') ?? 'unknown',
        lifecycle:
          defaultsConfig?.getOptionalString('lifecycle') ?? 'production',
      },
    };
  });
}

function serverMatchesFilters(
  server: HcloudServerDetails,
  filters?: { labels?: Record<string, string> },
): boolean {
  if (!filters?.labels) {
    return true;
  }
  return Object.entries(filters.labels).every(
    ([k, v]) => server.labels[k] === v,
  );
}

function serverToEntity(
  server: HcloudServerDetails,
  projectKey: string,
  defaults: { owner: string; lifecycle: string },
): Entity {
  const labels: Record<string, string> = {};
  for (const [k, v] of Object.entries(server.labels)) {
    // Sanitize label keys for Backstage (lowercase, alphanumeric + /-_.)
    const sanitized = k.toLowerCase().replace(/[^a-z0-9/_.-]/g, '-');
    labels[`hcloud.io/${sanitized}`] = v;
  }

  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Resource',
    metadata: {
      name: `hcloud-${projectKey}-${server.name}`,
      annotations: {
        [HCLOUD_SERVER_ANNOTATION]: String(server.id),
        [HCLOUD_PROJECT_ANNOTATION]: projectKey,
      },
      labels,
    },
    spec: {
      type: 'hcloud-server',
      owner: defaults.owner,
      lifecycle: defaults.lifecycle,
    },
  };
}

export class HcloudEntityProvider implements EntityProvider {
  readonly #providerConfigs: ProviderConfig[];
  readonly #hcloudService: HcloudService;
  readonly #logger: LoggerService;
  readonly #scheduler: SchedulerService;
  #connections: Map<string, EntityProviderConnection> = new Map();

  constructor(options: {
    config: Config;
    hcloudService: HcloudService;
    logger: LoggerService;
    scheduler: SchedulerService;
  }) {
    this.#providerConfigs = readProviderConfigs(options.config);
    this.#hcloudService = options.hcloudService;
    this.#logger = options.logger;
    this.#scheduler = options.scheduler;
  }

  getProviderName(): string {
    return 'hcloud';
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    for (const providerConfig of this.#providerConfigs) {
      this.#connections.set(providerConfig.projectKey, connection);

      await this.#scheduler.scheduleTask({
        id: `hcloud-entity-provider-${providerConfig.projectKey}`,
        frequency: providerConfig.schedule.frequency,
        timeout: providerConfig.schedule.timeout,
        fn: async () => {
          await this.#refresh(providerConfig);
        },
      });
    }
  }

  async #refresh(providerConfig: ProviderConfig): Promise<void> {
    const connection = this.#connections.get(providerConfig.projectKey);
    if (!connection) {
      return;
    }

    this.#logger.info(
      `Refreshing hcloud servers for project "${providerConfig.projectKey}"`,
    );

    try {
      const servers = await this.#hcloudService.listServers(
        providerConfig.projectKey,
      );

      const filtered = servers.filter(s =>
        serverMatchesFilters(s, providerConfig.filters),
      );

      const entities = filtered.map(s =>
        serverToEntity(s, providerConfig.projectKey, providerConfig.defaults),
      );

      await connection.applyMutation({
        type: 'full',
        entities: entities.map(entity => ({
          entity,
          locationKey: `hcloud-provider-${providerConfig.projectKey}`,
        })),
      });

      this.#logger.info(
        `Synced ${entities.length} servers from hcloud project "${providerConfig.projectKey}"`,
      );
    } catch (error) {
      this.#logger.error(
        `Failed to sync hcloud servers for project "${providerConfig.projectKey}"`,
        error as Error,
      );
    }
  }
}

export { readProviderConfigs, serverMatchesFilters, serverToEntity };
