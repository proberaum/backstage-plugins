// plugins/hcloud-module-catalog/src/provider/HcloudEntityProvider.test.ts
import { ConfigReader } from '@backstage/config';
import {
  readProviderConfigs,
  serverMatchesFilters,
  serverToEntity,
} from './HcloudEntityProvider';
import { HcloudServerDetails } from '@proberaum/backstage-plugin-hcloud-common';

const mockServer: HcloudServerDetails = {
  id: 12345,
  name: 'web-prod-01',
  status: 'running',
  server_type: { id: 1, name: 'cpx31', description: 'CPX 31', cores: 4, memory: 8, disk: 80 },
  datacenter: {
    id: 1, name: 'fsn1-dc14', description: 'Falkenstein 1 DC14',
    location: { id: 1, name: 'fsn1', description: 'Falkenstein', country: 'DE', city: 'Falkenstein' },
  },
  public_net: {
    ipv4: { ip: '1.2.3.4', blocked: false },
    ipv6: { ip: '::1', blocked: false },
    floating_ips: [], firewalls: [],
  },
  image: null,
  created: '2025-01-01T00:00:00Z',
  labels: { env: 'production', team: 'platform', managed: 'true' },
  volumes: [],
  protection: { delete: false, rebuild: false },
  backup_window: null,
  outgoing_traffic: null,
  ingoing_traffic: null,
  included_traffic: 0,
  load_balancers: [],
};

describe('readProviderConfigs', () => {
  it('reads provider configs', () => {
    const config = new ConfigReader({
      catalog: {
        providers: {
          hcloud: {
            prod: {
              schedule: {
                frequency: { minutes: 5 },
                timeout: { minutes: 3 },
              },
              filters: { labels: { managed: 'true' } },
              defaults: { owner: 'group:platform', lifecycle: 'production' },
            },
          },
        },
      },
    });

    const configs = readProviderConfigs(config);
    expect(configs).toHaveLength(1);
    expect(configs[0].projectKey).toBe('prod');
    expect(configs[0].filters?.labels).toEqual({ managed: 'true' });
    expect(configs[0].defaults.owner).toBe('group:platform');
  });

  it('returns empty array when no config', () => {
    const config = new ConfigReader({});
    expect(readProviderConfigs(config)).toEqual([]);
  });
});

describe('serverMatchesFilters', () => {
  it('matches when no filters', () => {
    expect(serverMatchesFilters(mockServer)).toBe(true);
  });

  it('matches when labels match', () => {
    expect(
      serverMatchesFilters(mockServer, { labels: { managed: 'true' } }),
    ).toBe(true);
  });

  it('rejects when labels do not match', () => {
    expect(
      serverMatchesFilters(mockServer, { labels: { managed: 'false' } }),
    ).toBe(false);
  });
});

describe('serverToEntity', () => {
  it('converts server to Resource entity', () => {
    const entity = serverToEntity(mockServer, 'prod', {
      owner: 'group:platform',
      lifecycle: 'production',
    });

    expect(entity.kind).toBe('Resource');
    expect(entity.metadata.name).toBe('hcloud-prod-web-prod-01');
    expect(entity.metadata.annotations?.['hcloud/server']).toBe('12345');
    expect(entity.metadata.annotations?.['hcloud/project']).toBe('prod');
    expect(entity.metadata.labels?.['hcloud.io/env']).toBe('production');
    expect(entity.metadata.labels?.['hcloud.io/team']).toBe('platform');
    expect((entity.spec as any).type).toBe('hcloud-server');
    expect((entity.spec as any).owner).toBe('group:platform');
  });
});
