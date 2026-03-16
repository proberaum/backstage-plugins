import { Config } from '@backstage/config';

/**
 * @public
 */
export interface HcloudProjectConfig {
  token: string;
}

/**
 * @public
 */
export interface HcloudCacheConfig {
  ttl: number;
  metricsTtl: number;
}

/**
 * @public
 */
export interface HcloudConfig {
  projects: Record<string, HcloudProjectConfig>;
  defaultProject: string;
  cache: HcloudCacheConfig;
}

/**
 * @public
 */
export function readHcloudConfig(config: Config): HcloudConfig {
  const hcloud = config.getConfig('hcloud');
  const projectsConfig = hcloud.getConfig('projects');
  const projectKeys = projectsConfig.keys();

  if (projectKeys.length === 0) {
    throw new Error('hcloud: at least one project must be configured');
  }

  const projects: Record<string, HcloudProjectConfig> = {};
  for (const key of projectKeys) {
    projects[key] = {
      token: projectsConfig.getConfig(key).getString('token'),
    };
  }

  const defaultProject = hcloud.getString('defaultProject');
  if (!projects[defaultProject]) {
    throw new Error(
      `hcloud: defaultProject "${defaultProject}" does not match any configured project (${projectKeys.join(
        ', ',
      )})`,
    );
  }

  const cacheConfig = hcloud.getOptionalConfig('cache');
  const cache: HcloudCacheConfig = {
    ttl: cacheConfig?.getOptionalNumber('ttl') ?? 30,
    metricsTtl: cacheConfig?.getOptionalNumber('metricsTtl') ?? 60,
  };

  return { projects, defaultProject, cache };
}
