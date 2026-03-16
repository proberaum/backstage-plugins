# Hetzner Cloud Backstage Plugin Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Backstage plugin that shows Hetzner Cloud server status on entity pages and optionally imports servers into the catalog.

**Architecture:** Four packages — `hcloud-common` (shared types/constants), `hcloud-backend` (API routes + hcloud HTTP client + caching), `hcloud` (frontend card + tab), `hcloud-module-catalog` (optional entity provider). Backend wraps Hetzner Cloud REST API directly (no SDK). Frontend consumes backend API via hooks.

**Tech Stack:** TypeScript, React 18, Material-UI 4, Express, Backstage new backend system (`@backstage/backend-plugin-api`), `node-fetch`, `zod` for validation, `recharts` for metrics charts.

**Spec:** `docs/superpowers/specs/2026-03-16-hcloud-plugin-design.md`

---

## Chunk 1: Foundation — Common Package + Backend Hcloud Client

### Task 1: Scaffold `hcloud-common` package

**Files:**
- Create: `plugins/hcloud-common/package.json`
- Create: `plugins/hcloud-common/src/index.ts`
- Create: `plugins/hcloud-common/src/annotations.ts`
- Create: `plugins/hcloud-common/src/types.ts`
- Create: `plugins/hcloud-common/src/utils.ts`
- Create: `plugins/hcloud-common/tsconfig.json`
- Test: `plugins/hcloud-common/src/utils.test.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@proberaum/backstage-plugin-hcloud-common",
  "version": "0.1.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "license": "Apache-2.0",
  "publishConfig": {
    "access": "public",
    "main": "dist/index.cjs.js",
    "types": "dist/index.d.ts"
  },
  "backstage": {
    "role": "common-library",
    "pluginId": "hcloud",
    "pluginPackages": [
      "@proberaum/backstage-plugin-hcloud",
      "@proberaum/backstage-plugin-hcloud-backend",
      "@proberaum/backstage-plugin-hcloud-common",
      "@proberaum/backstage-plugin-hcloud-module-catalog"
    ]
  },
  "sideEffects": false,
  "scripts": {
    "start": "backstage-cli package start",
    "build": "backstage-cli package build",
    "lint": "backstage-cli package lint",
    "test": "backstage-cli package test",
    "clean": "backstage-cli package clean",
    "prepack": "backstage-cli package prepack",
    "postpack": "backstage-cli package postpack"
  },
  "devDependencies": {
    "@backstage/cli": "^0.35.4"
  }
}
```

- [ ] **Step 2: Create annotations.ts**

```typescript
/**
 * Annotation key for the hcloud server reference (ID or name).
 * Numeric values are treated as server IDs, non-numeric as server names.
 */
export const HCLOUD_SERVER_ANNOTATION = 'hcloud/server';

/**
 * Annotation key for the hcloud project.
 * Must match a key in hcloud.projects config. Optional — falls back to defaultProject.
 */
export const HCLOUD_PROJECT_ANNOTATION = 'hcloud/project';
```

- [ ] **Step 3: Create types.ts**

```typescript
/** Hetzner Cloud server status values */
export type HcloudServerStatus =
  | 'running'
  | 'initializing'
  | 'starting'
  | 'stopping'
  | 'off'
  | 'deleting'
  | 'migrating'
  | 'rebuilding'
  | 'unknown';

/** Server type info (vCPU, memory, disk) */
export interface HcloudServerType {
  id: number;
  name: string;
  description: string;
  cores: number;
  memory: number;
  disk: number;
}

/** Datacenter location */
export interface HcloudLocation {
  id: number;
  name: string;
  description: string;
  country: string;
  city: string;
}

/** Datacenter info */
export interface HcloudDatacenter {
  id: number;
  name: string;
  description: string;
  location: HcloudLocation;
}

/** IPv4 info */
export interface HcloudIPv4 {
  ip: string;
  blocked: boolean;
}

/** IPv6 info */
export interface HcloudIPv6 {
  ip: string;
  blocked: boolean;
}

/** Public networking */
export interface HcloudPublicNet {
  ipv4: HcloudIPv4;
  ipv6: HcloudIPv6;
  floating_ips: number[];
  firewalls: Array<{ id: number; status: string }>;
}

/** Server image */
export interface HcloudImage {
  id: number;
  type: string;
  name: string | null;
  description: string;
  created: string;
}

/** Protection settings */
export interface HcloudProtection {
  delete: boolean;
  rebuild: boolean;
}

/** Volume info (denormalized from volumes API) */
export interface HcloudVolume {
  id: number;
  name: string;
  size: number;
  format: string | null;
  linux_device: string | null;
}

/** Full server details returned by the backend API */
export interface HcloudServerDetails {
  id: number;
  name: string;
  status: HcloudServerStatus;
  server_type: HcloudServerType;
  datacenter: HcloudDatacenter;
  public_net: HcloudPublicNet;
  image: HcloudImage | null;
  created: string;
  labels: Record<string, string>;
  volumes: HcloudVolume[];
  protection: HcloudProtection;
  backup_window: string | null;
  outgoing_traffic: number | null;
  ingoing_traffic: number | null;
  included_traffic: number;
  load_balancers: number[];
}

/** Valid metric types */
export type HcloudMetricType = 'cpu' | 'disk' | 'network';

/** Valid time range presets */
export type HcloudTimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

/** A single time series */
export interface HcloudTimeSeries {
  name: string;
  values: Array<{ timestamp: number; value: number }>;
}

/** Metrics response from the backend API */
export interface HcloudMetricsResponse {
  type: HcloudMetricType;
  range: HcloudTimeRange;
  start: string;
  end: string;
  step: number;
  timeSeries: HcloudTimeSeries[];
}
```

- [ ] **Step 4: Create utils.ts**

```typescript
/**
 * Returns true if the server ref is a numeric ID, false if it's a name.
 */
export function isServerId(ref: string): boolean {
  return /^\d+$/.test(ref);
}
```

- [ ] **Step 5: Write failing test for isServerId**

```typescript
// plugins/hcloud-common/src/utils.test.ts
import { isServerId } from './utils';

describe('isServerId', () => {
  it('returns true for numeric strings', () => {
    expect(isServerId('12345')).toBe(true);
    expect(isServerId('0')).toBe(true);
  });

  it('returns false for non-numeric strings', () => {
    expect(isServerId('web-prod-01')).toBe(false);
    expect(isServerId('12345abc')).toBe(false);
    expect(isServerId('')).toBe(false);
  });
});
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd plugins/hcloud-common && yarn test`
Expected: PASS

- [ ] **Step 7: Create index.ts**

```typescript
export {
  HCLOUD_SERVER_ANNOTATION,
  HCLOUD_PROJECT_ANNOTATION,
} from './annotations';
export type {
  HcloudServerStatus,
  HcloudServerType,
  HcloudLocation,
  HcloudDatacenter,
  HcloudIPv4,
  HcloudIPv6,
  HcloudPublicNet,
  HcloudImage,
  HcloudProtection,
  HcloudVolume,
  HcloudServerDetails,
  HcloudMetricType,
  HcloudTimeRange,
  HcloudTimeSeries,
  HcloudMetricsResponse,
} from './types';
export { isServerId } from './utils';
```

- [ ] **Step 8: Create tsconfig.json**

```json
{
  "extends": "@backstage/cli/config/tsconfig.json",
  "include": ["src"],
  "exclude": ["node_modules"],
  "compilerOptions": {
    "outDir": "dist-types",
    "rootDir": "."
  }
}
```

- [ ] **Step 9: Install dependencies and verify build**

Run: `cd /home/christoph/git/proberaum/backstage-plugins-hcloud/workspaces/hcloud && yarn install && cd plugins/hcloud-common && yarn build`
Expected: Build succeeds

- [ ] **Step 10: Commit**

```bash
git add plugins/hcloud-common/
git commit -m "feat(hcloud): add hcloud-common package with types, annotations, and utilities"
```

---

### Task 2: Scaffold `hcloud-backend` package with Hcloud HTTP client

**Files:**
- Create: `plugins/hcloud-backend/package.json`
- Create: `plugins/hcloud-backend/tsconfig.json`
- Create: `plugins/hcloud-backend/src/index.ts`
- Create: `plugins/hcloud-backend/src/client/HcloudClient.ts`
- Create: `plugins/hcloud-backend/src/client/HcloudClient.test.ts`
- Create: `plugins/hcloud-backend/src/client/index.ts`
- Create: `plugins/hcloud-backend/src/config.ts`
- Create: `plugins/hcloud-backend/src/config.test.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@proberaum/backstage-plugin-hcloud-backend",
  "version": "0.1.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "license": "Apache-2.0",
  "publishConfig": {
    "access": "public",
    "main": "dist/index.cjs.js",
    "types": "dist/index.d.ts"
  },
  "backstage": {
    "role": "backend-plugin",
    "pluginId": "hcloud",
    "pluginPackages": [
      "@proberaum/backstage-plugin-hcloud",
      "@proberaum/backstage-plugin-hcloud-backend",
      "@proberaum/backstage-plugin-hcloud-common",
      "@proberaum/backstage-plugin-hcloud-module-catalog"
    ]
  },
  "scripts": {
    "start": "backstage-cli package start",
    "build": "backstage-cli package build",
    "lint": "backstage-cli package lint",
    "test": "backstage-cli package test",
    "clean": "backstage-cli package clean",
    "prepack": "backstage-cli package prepack",
    "postpack": "backstage-cli package postpack"
  },
  "dependencies": {
    "@backstage/backend-plugin-api": "^1.7.0",
    "@backstage/config": "^1.3.6",
    "@backstage/errors": "^1.2.7",
    "@proberaum/backstage-plugin-hcloud-common": "workspace:^",
    "express": "^4.21.0",
    "express-promise-router": "^4.1.0",
    "node-fetch": "^2.7.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@backstage/backend-test-utils": "^1.7.0",
    "@backstage/cli": "^0.35.4",
    "@types/express": "*",
    "@types/node-fetch": "^2.6.0",
    "@types/supertest": "^6.0.0",
    "msw": "^2.0.0",
    "supertest": "^7.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "@backstage/cli/config/tsconfig.json",
  "include": ["src"],
  "exclude": ["node_modules"],
  "compilerOptions": {
    "outDir": "dist-types",
    "rootDir": "."
  }
}
```

- [ ] **Step 3: Create config.ts — config reader with validation**

```typescript
import { Config } from '@backstage/config';

export interface HcloudProjectConfig {
  token: string;
}

export interface HcloudCacheConfig {
  ttl: number;
  metricsTtl: number;
}

export interface HcloudConfig {
  projects: Record<string, HcloudProjectConfig>;
  defaultProject: string;
  cache: HcloudCacheConfig;
}

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
      `hcloud: defaultProject "${defaultProject}" does not match any configured project (${projectKeys.join(', ')})`,
    );
  }

  const cacheConfig = hcloud.getOptionalConfig('cache');
  const cache: HcloudCacheConfig = {
    ttl: cacheConfig?.getOptionalNumber('ttl') ?? 30,
    metricsTtl: cacheConfig?.getOptionalNumber('metricsTtl') ?? 60,
  };

  return { projects, defaultProject, cache };
}
```

- [ ] **Step 4: Write failing test for config reader**

```typescript
// plugins/hcloud-backend/src/config.test.ts
import { ConfigReader } from '@backstage/config';
import { readHcloudConfig } from './config';

describe('readHcloudConfig', () => {
  it('reads a valid config', () => {
    const config = new ConfigReader({
      hcloud: {
        projects: {
          prod: { token: 'tok-prod' },
          staging: { token: 'tok-staging' },
        },
        defaultProject: 'prod',
      },
    });

    const result = readHcloudConfig(config);
    expect(result.projects).toEqual({
      prod: { token: 'tok-prod' },
      staging: { token: 'tok-staging' },
    });
    expect(result.defaultProject).toBe('prod');
    expect(result.cache).toEqual({ ttl: 30, metricsTtl: 60 });
  });

  it('throws when no projects configured', () => {
    const config = new ConfigReader({
      hcloud: {
        projects: {},
        defaultProject: 'prod',
      },
    });

    expect(() => readHcloudConfig(config)).toThrow(
      'at least one project must be configured',
    );
  });

  it('throws when defaultProject does not match', () => {
    const config = new ConfigReader({
      hcloud: {
        projects: { prod: { token: 'tok' } },
        defaultProject: 'staging',
      },
    });

    expect(() => readHcloudConfig(config)).toThrow(
      'defaultProject "staging" does not match',
    );
  });

  it('reads custom cache TTLs', () => {
    const config = new ConfigReader({
      hcloud: {
        projects: { prod: { token: 'tok' } },
        defaultProject: 'prod',
        cache: { ttl: 10, metricsTtl: 120 },
      },
    });

    const result = readHcloudConfig(config);
    expect(result.cache).toEqual({ ttl: 10, metricsTtl: 120 });
  });
});
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd plugins/hcloud-backend && yarn test -- --testPathPattern config.test`
Expected: PASS

- [ ] **Step 6: Create HcloudClient.ts — direct HTTP wrapper**

```typescript
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

const RANGE_PARAMS: Record<HcloudTimeRange, { offsetMs: number; step: number }> = {
  '1h':  { offsetMs: 60 * 60 * 1000,          step: 60 },
  '6h':  { offsetMs: 6 * 60 * 60 * 1000,      step: 300 },
  '24h': { offsetMs: 24 * 60 * 60 * 1000,     step: 900 },
  '7d':  { offsetMs: 7 * 24 * 60 * 60 * 1000, step: 3600 },
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
    const data = await this.#request(`/servers?name=${encodeURIComponent(name)}`);
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
      data.metrics.time_series as Record<string, { values: Array<[number, string]> }>,
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
    // Resolve volume details from IDs
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
```

- [ ] **Step 7: Write test for HcloudClient using msw**

```typescript
// plugins/hcloud-backend/src/client/HcloudClient.test.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { HcloudClient } from './HcloudClient';

const MOCK_SERVER_RAW = {
  id: 12345,
  name: 'web-prod-01',
  status: 'running',
  server_type: {
    id: 1,
    name: 'cpx31',
    description: 'CPX 31',
    cores: 4,
    memory: 8,
    disk: 80,
  },
  datacenter: {
    id: 1,
    name: 'fsn1-dc14',
    description: 'Falkenstein 1 DC14',
    location: {
      id: 1,
      name: 'fsn1',
      description: 'Falkenstein DC Park 1',
      country: 'DE',
      city: 'Falkenstein',
    },
  },
  public_net: {
    ipv4: { ip: '116.203.42.15', blocked: false },
    ipv6: { ip: '2a01:4f8:c012:abc::/64', blocked: false },
    floating_ips: [],
    firewalls: [],
  },
  image: {
    id: 100,
    type: 'system',
    name: 'ubuntu-24.04',
    description: 'Ubuntu 24.04',
    created: '2025-01-01T00:00:00+00:00',
  },
  created: '2025-08-14T10:00:00+00:00',
  labels: { env: 'production', team: 'platform' },
  volumes: [],
  protection: { delete: true, rebuild: true },
  backup_window: '02-06',
  outgoing_traffic: 1000000,
  ingoing_traffic: 2000000,
  included_traffic: 654321000000,
  load_balancers: [],
};

const mswServer = setupServer(
  http.get('https://api.hetzner.cloud/v1/servers/12345', () => {
    return HttpResponse.json({ server: MOCK_SERVER_RAW });
  }),
  http.get('https://api.hetzner.cloud/v1/servers', ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    if (name === 'web-prod-01') {
      return HttpResponse.json({ servers: [MOCK_SERVER_RAW] });
    }
    if (name === 'nonexistent') {
      return HttpResponse.json({ servers: [] });
    }
    return HttpResponse.json({
      servers: [MOCK_SERVER_RAW],
      meta: { pagination: { next_page: null } },
    });
  }),
  http.get('https://api.hetzner.cloud/v1/servers/12345/metrics', () => {
    return HttpResponse.json({
      metrics: {
        start: '2026-03-16T11:00:00Z',
        end: '2026-03-16T12:00:00Z',
        step: 60,
        time_series: {
          cpu: {
            values: [
              [1710586800, '15.3'],
              [1710586860, '22.1'],
            ],
          },
        },
      },
    });
  }),
  http.get('https://api.hetzner.cloud/v1/servers/99999', () => {
    return HttpResponse.json(
      { error: { message: 'server not found', code: 'not_found' } },
      { status: 404 },
    );
  }),
);

beforeAll(() => mswServer.listen());
afterAll(() => mswServer.close());
afterEach(() => mswServer.resetHandlers());

describe('HcloudClient', () => {
  const client = new HcloudClient('test-token');

  it('fetches server by ID', async () => {
    const server = await client.getServerById(12345);
    expect(server.id).toBe(12345);
    expect(server.name).toBe('web-prod-01');
    expect(server.status).toBe('running');
    expect(server.server_type.cores).toBe(4);
    expect(server.datacenter.name).toBe('fsn1-dc14');
    expect(server.public_net.ipv4.ip).toBe('116.203.42.15');
  });

  it('fetches server by name', async () => {
    const server = await client.getServerByName('web-prod-01');
    expect(server.id).toBe(12345);
  });

  it('throws NotFoundError for unknown name', async () => {
    await expect(client.getServerByName('nonexistent')).rejects.toThrow(
      'not found',
    );
  });

  it('auto-detects ID vs name via getServer', async () => {
    const byId = await client.getServer('12345');
    expect(byId.id).toBe(12345);

    const byName = await client.getServer('web-prod-01');
    expect(byName.id).toBe(12345);
  });

  it('throws NotFoundError for unknown server ID', async () => {
    await expect(client.getServerById(99999)).rejects.toThrow();
  });

  it('fetches metrics', async () => {
    const metrics = await client.getServerMetrics(12345, 'cpu', '1h');
    expect(metrics.type).toBe('cpu');
    expect(metrics.range).toBe('1h');
    expect(metrics.step).toBe(60);
    expect(metrics.timeSeries).toHaveLength(1);
    expect(metrics.timeSeries[0].name).toBe('cpu');
    expect(metrics.timeSeries[0].values).toHaveLength(2);
    expect(metrics.timeSeries[0].values[0].value).toBe(15.3);
  });
});
```

- [ ] **Step 8: Create client/index.ts**

```typescript
export { HcloudClient } from './HcloudClient';
```

- [ ] **Step 9: Run tests to verify they pass**

Run: `cd plugins/hcloud-backend && yarn test -- --testPathPattern HcloudClient.test`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add plugins/hcloud-backend/
git commit -m "feat(hcloud): add hcloud-backend package with HTTP client and config reader"
```

---

### Task 3: Backend service ref, caching, and API routes

**Files:**
- Create: `plugins/hcloud-backend/src/service.ts`
- Create: `plugins/hcloud-backend/src/service.test.ts`
- Create: `plugins/hcloud-backend/src/router.ts`
- Create: `plugins/hcloud-backend/src/router.test.ts`
- Create: `plugins/hcloud-backend/src/plugin.ts`
- Create: `plugins/hcloud-backend/src/plugin.test.ts`
- Modify: `plugins/hcloud-backend/src/index.ts`

- [ ] **Step 1: Create service.ts — service with caching + service ref**

```typescript
import {
  coreServices,
  createServiceFactory,
  createServiceRef,
  LoggerService,
  CacheService,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';
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

  async getServer(
    ref: string,
    project?: string,
  ): Promise<HcloudServerDetails> {
    const projectKey = this.#resolveProject(project);
    const cacheKey = `server:${projectKey}:${ref}`;

    const cached = await this.#cache.get<HcloudServerDetails>(cacheKey);
    if (cached) {
      return cached;
    }

    const client = this.#getClient(projectKey);
    const server = await client.getServer(ref);

    await this.#cache.set(cacheKey, server, {
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
    // Resolve server to ID first (uses server cache)
    const server = await this.getServer(ref, project);
    const projectKey = this.#resolveProject(project);
    const cacheKey = `metrics:${projectKey}:${server.id}:${type}:${range}`;

    const cached = await this.#cache.get<HcloudMetricsResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const client = this.#getClient(projectKey);
    const metrics = await client.getServerMetrics(server.id, type, range);

    await this.#cache.set(cacheKey, metrics, {
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
```

- [ ] **Step 2: Write failing test for DefaultHcloudService**

```typescript
// plugins/hcloud-backend/src/service.test.ts
import { DefaultHcloudService } from './service';
import { HcloudConfig } from './config';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const MOCK_SERVER_RAW = {
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
  labels: {},
  volumes: [],
  protection: { delete: false, rebuild: false },
  backup_window: null,
  outgoing_traffic: null,
  ingoing_traffic: null,
  included_traffic: 0,
  load_balancers: [],
};

const mswServer = setupServer(
  http.get('https://api.hetzner.cloud/v1/servers/12345', () =>
    HttpResponse.json({ server: MOCK_SERVER_RAW }),
  ),
  http.get('https://api.hetzner.cloud/v1/servers', ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('name') === 'web-prod-01') {
      return HttpResponse.json({ servers: [MOCK_SERVER_RAW] });
    }
    return HttpResponse.json({
      servers: [MOCK_SERVER_RAW],
      meta: { pagination: { next_page: null } },
    });
  }),
  http.get('https://api.hetzner.cloud/v1/servers/12345/metrics', () =>
    HttpResponse.json({
      metrics: {
        start: '2026-03-16T11:00:00Z',
        end: '2026-03-16T12:00:00Z',
        step: 60,
        time_series: { cpu: { values: [[1710586800, '10.5']] } },
      },
    }),
  ),
);

beforeAll(() => mswServer.listen());
afterAll(() => mswServer.close());
afterEach(() => mswServer.resetHandlers());

const mockConfig: HcloudConfig = {
  projects: {
    prod: { token: 'tok-prod' },
    staging: { token: 'tok-staging' },
  },
  defaultProject: 'prod',
  cache: { ttl: 30, metricsTtl: 60 },
};

const mockCache = {
  get: jest.fn().mockResolvedValue(undefined),
  set: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
  withOptions: jest.fn().mockReturnThis(),
};

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

describe('DefaultHcloudService', () => {
  let service: DefaultHcloudService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DefaultHcloudService({
      config: mockConfig,
      cache: mockCache as any,
      logger: mockLogger as any,
    });
  });

  it('returns project keys', () => {
    expect(service.getProjectKeys()).toEqual(['prod', 'staging']);
  });

  it('fetches server using default project', async () => {
    const server = await service.getServer('12345');
    expect(server.id).toBe(12345);
    expect(mockCache.set).toHaveBeenCalledWith(
      'server:prod:12345',
      expect.objectContaining({ id: 12345 }),
      { ttl: 30000 },
    );
  });

  it('returns cached server on second call', async () => {
    mockCache.get.mockResolvedValueOnce({ id: 12345, name: 'cached' });
    const server = await service.getServer('12345');
    expect(server.name).toBe('cached');
  });

  it('throws InputError for unknown project', async () => {
    await expect(service.getServer('12345', 'unknown')).rejects.toThrow(
      'Unknown hcloud project "unknown"',
    );
  });

  it('fetches metrics', async () => {
    const metrics = await service.getServerMetrics('12345', 'cpu', '1h');
    expect(metrics.type).toBe('cpu');
    expect(metrics.timeSeries[0].values[0].value).toBe(10.5);
  });
});
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `cd plugins/hcloud-backend && yarn test -- --testPathPattern service.test`
Expected: PASS

- [ ] **Step 4: Create router.ts — Express API routes**

```typescript
import { HttpAuthService } from '@backstage/backend-plugin-api';
import { InputError } from '@backstage/errors';
import express from 'express';
import Router from 'express-promise-router';
import { z } from 'zod';
import { HcloudService } from './service';

const metricsQuerySchema = z.object({
  type: z.enum(['cpu', 'disk', 'network']),
  range: z.enum(['1h', '6h', '24h', '7d', '30d']),
  project: z.string().optional(),
});

export async function createRouter(options: {
  httpAuth: HttpAuthService;
  hcloudService: HcloudService;
}): Promise<express.Router> {
  const { httpAuth, hcloudService } = options;
  const router = Router();
  router.use(express.json());

  router.get('/servers/:ref', async (req, res) => {
    await httpAuth.credentials(req, { allow: ['user'] });

    const { ref } = req.params;
    const project = req.query.project as string | undefined;

    const server = await hcloudService.getServer(ref, project);
    res.json(server);
  });

  router.get('/servers/:ref/metrics', async (req, res) => {
    await httpAuth.credentials(req, { allow: ['user'] });

    const { ref } = req.params;
    const parsed = metricsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new InputError(
        `Invalid query parameters: ${parsed.error.message}`,
      );
    }

    const { type, range, project } = parsed.data;
    const metrics = await hcloudService.getServerMetrics(
      ref,
      type,
      range,
      project,
    );
    res.json(metrics);
  });

  return router;
}
```

- [ ] **Step 5: Create plugin.ts — backend plugin registration**

```typescript
import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { hcloudServiceRef } from './service';

export const hcloudPlugin = createBackendPlugin({
  pluginId: 'hcloud',
  register(env) {
    env.registerInit({
      deps: {
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        hcloudService: hcloudServiceRef,
      },
      async init({ httpAuth, httpRouter, hcloudService }) {
        httpRouter.use(
          await createRouter({
            httpAuth,
            hcloudService,
          }),
        );
      },
    });
  },
});
```

- [ ] **Step 6: Write test for router**

```typescript
// plugins/hcloud-backend/src/router.test.ts
import { startTestBackend } from '@backstage/backend-test-utils';
import { hcloudPlugin } from './plugin';
import { hcloudServiceRef, HcloudService } from './service';
import { createServiceFactory } from '@backstage/backend-plugin-api';
import request from 'supertest';

const mockHcloudService: jest.Mocked<HcloudService> = {
  getServer: jest.fn().mockResolvedValue({
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
    labels: {},
    volumes: [],
    protection: { delete: false, rebuild: false },
    backup_window: null,
    outgoing_traffic: null,
    ingoing_traffic: null,
    included_traffic: 0,
    load_balancers: [],
  }),
  getServerMetrics: jest.fn().mockResolvedValue({
    type: 'cpu',
    range: '1h',
    start: '2026-03-16T11:00:00Z',
    end: '2026-03-16T12:00:00Z',
    step: 60,
    timeSeries: [{ name: 'cpu', values: [{ timestamp: 1, value: 10.5 }] }],
  }),
  listServers: jest.fn().mockResolvedValue([]),
  getProjectKeys: jest.fn().mockReturnValue(['prod']),
};

describe('router', () => {
  let server: any;

  beforeAll(async () => {
    const backend = await startTestBackend({
      features: [
        hcloudPlugin,
        createServiceFactory({
          service: hcloudServiceRef,
          deps: {},
          async factory() {
            return mockHcloudService;
          },
        }),
      ],
    });
    server = backend.server;
  });

  it('GET /servers/:ref returns server details', async () => {
    const res = await request(server)
      .get('/api/hcloud/servers/12345')
      .expect(200);

    expect(res.body.id).toBe(12345);
    expect(res.body.name).toBe('web-prod-01');
    expect(mockHcloudService.getServer).toHaveBeenCalledWith(
      '12345',
      undefined,
    );
  });

  it('GET /servers/:ref with project query param', async () => {
    await request(server)
      .get('/api/hcloud/servers/12345?project=staging')
      .expect(200);

    expect(mockHcloudService.getServer).toHaveBeenCalledWith(
      '12345',
      'staging',
    );
  });

  it('GET /servers/:ref/metrics returns metrics', async () => {
    const res = await request(server)
      .get('/api/hcloud/servers/12345/metrics?type=cpu&range=1h')
      .expect(200);

    expect(res.body.type).toBe('cpu');
    expect(res.body.timeSeries).toHaveLength(1);
  });

  it('GET /servers/:ref/metrics with invalid type returns 400', async () => {
    await request(server)
      .get('/api/hcloud/servers/12345/metrics?type=invalid&range=1h')
      .expect(400);
  });

  it('GET /servers/:ref/metrics with invalid range returns 400', async () => {
    await request(server)
      .get('/api/hcloud/servers/12345/metrics?type=cpu&range=2h')
      .expect(400);
  });
});
```

- [ ] **Step 7: Update index.ts — public exports**

```typescript
export { hcloudPlugin as default } from './plugin';
export { hcloudServiceRef } from './service';
export type { HcloudService } from './service';
```

- [ ] **Step 8: Run all backend tests**

Run: `cd plugins/hcloud-backend && yarn test`
Expected: All tests PASS

- [ ] **Step 9: Commit**

```bash
git add plugins/hcloud-backend/
git commit -m "feat(hcloud): add backend plugin with service, caching, and API routes"
```

---

## Chunk 2: Frontend Plugin

### Task 4: Scaffold `hcloud` frontend plugin with API client and hooks

**Files:**
- Create: `plugins/hcloud/package.json`
- Create: `plugins/hcloud/tsconfig.json`
- Create: `plugins/hcloud/src/index.ts`
- Create: `plugins/hcloud/src/plugin.ts`
- Create: `plugins/hcloud/src/plugin.test.ts`
- Create: `plugins/hcloud/src/api.ts`
- Create: `plugins/hcloud/src/hooks/useServerDetails.ts`
- Create: `plugins/hcloud/src/hooks/useServerMetrics.ts`
- Create: `plugins/hcloud/src/hooks/index.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@proberaum/backstage-plugin-hcloud",
  "version": "0.1.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "license": "Apache-2.0",
  "publishConfig": {
    "access": "public",
    "main": "dist/index.esm.js",
    "types": "dist/index.d.ts"
  },
  "backstage": {
    "role": "frontend-plugin",
    "pluginId": "hcloud",
    "pluginPackages": [
      "@proberaum/backstage-plugin-hcloud",
      "@proberaum/backstage-plugin-hcloud-backend",
      "@proberaum/backstage-plugin-hcloud-common",
      "@proberaum/backstage-plugin-hcloud-module-catalog"
    ]
  },
  "sideEffects": false,
  "scripts": {
    "start": "backstage-cli package start",
    "build": "backstage-cli package build",
    "lint": "backstage-cli package lint",
    "test": "backstage-cli package test",
    "clean": "backstage-cli package clean",
    "prepack": "backstage-cli package prepack",
    "postpack": "backstage-cli package postpack"
  },
  "dependencies": {
    "@backstage/catalog-model": "^1.7.4",
    "@backstage/core-components": "^0.16.7",
    "@backstage/core-plugin-api": "^1.10.5",
    "@backstage/errors": "^1.2.7",
    "@backstage/plugin-catalog-react": "^1.17.0",
    "@material-ui/core": "^4.12.4",
    "@material-ui/lab": "^4.0.0-alpha.61",
    "@proberaum/backstage-plugin-hcloud-common": "workspace:^",
    "recharts": "^2.12.0"
  },
  "devDependencies": {
    "@backstage/cli": "^0.35.4",
    "@backstage/dev-utils": "^1.2.1",
    "@backstage/test-utils": "^1.8.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^14.0.0"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "@backstage/cli/config/tsconfig.json",
  "include": ["src"],
  "exclude": ["node_modules"],
  "compilerOptions": {
    "outDir": "dist-types",
    "rootDir": "."
  }
}
```

- [ ] **Step 3: Create api.ts — frontend API client**

```typescript
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
    const url = `${baseUrl}/servers/${encodeURIComponent(ref)}/metrics?${params}`;

    const response = await this.#fetchApi.fetch(url);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json();
  }
}
```

- [ ] **Step 4: Create hooks/useServerDetails.ts**

```typescript
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  HCLOUD_SERVER_ANNOTATION,
  HCLOUD_PROJECT_ANNOTATION,
  HcloudServerDetails,
} from '@proberaum/backstage-plugin-hcloud-common';
import { hcloudApiRef } from '../api';

export interface UseServerDetailsResult {
  server: HcloudServerDetails | undefined;
  loading: boolean;
  error: Error | undefined;
  refresh: () => void;
}

export function useServerDetails(): UseServerDetailsResult {
  const { entity } = useEntity();
  const api = useApi(hcloudApiRef);
  const [server, setServer] = useState<HcloudServerDetails>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const mountedRef = useRef(true);

  const ref = entity.metadata.annotations?.[HCLOUD_SERVER_ANNOTATION];
  const project = entity.metadata.annotations?.[HCLOUD_PROJECT_ANNOTATION];

  const load = useCallback(async () => {
    if (!ref) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const result = await api.getServer(ref, project);
      if (mountedRef.current) {
        setServer(result);
      }
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e : new Error(String(e)));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [api, ref, project]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  return { server, loading, error, refresh: load };
}
```

- [ ] **Step 5: Create hooks/useServerMetrics.ts**

```typescript
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  HCLOUD_SERVER_ANNOTATION,
  HCLOUD_PROJECT_ANNOTATION,
  HcloudMetricType,
  HcloudTimeRange,
  HcloudMetricsResponse,
} from '@proberaum/backstage-plugin-hcloud-common';
import { hcloudApiRef } from '../api';

export interface UseServerMetricsResult {
  metrics: HcloudMetricsResponse | undefined;
  loading: boolean;
  error: Error | undefined;
  refresh: () => void;
}

export function useServerMetrics(
  type: HcloudMetricType,
  range: HcloudTimeRange,
): UseServerMetricsResult {
  const { entity } = useEntity();
  const api = useApi(hcloudApiRef);
  const [metrics, setMetrics] = useState<HcloudMetricsResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const mountedRef = useRef(true);

  const ref = entity.metadata.annotations?.[HCLOUD_SERVER_ANNOTATION];
  const project = entity.metadata.annotations?.[HCLOUD_PROJECT_ANNOTATION];

  const load = useCallback(async () => {
    if (!ref) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const result = await api.getServerMetrics(ref, type, range, project);
      if (mountedRef.current) {
        setMetrics(result);
      }
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e : new Error(String(e)));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [api, ref, project, type, range]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  return { metrics, loading, error, refresh: load };
}
```

- [ ] **Step 6: Create hooks/index.ts**

```typescript
export { useServerDetails } from './useServerDetails';
export type { UseServerDetailsResult } from './useServerDetails';
export { useServerMetrics } from './useServerMetrics';
export type { UseServerMetricsResult } from './useServerMetrics';
```

- [ ] **Step 7: Create plugin.ts**

```typescript
import {
  createApiFactory,
  createPlugin,
  createComponentExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';
import { hcloudApiRef, HcloudApiClient } from './api';

export const hcloudPlugin = createPlugin({
  id: 'hcloud',
  apis: [
    createApiFactory({
      api: hcloudApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new HcloudApiClient({ discoveryApi, fetchApi }),
    }),
  ],
});

export const EntityHcloudServerCard = hcloudPlugin.provide(
  createComponentExtension({
    name: 'EntityHcloudServerCard',
    component: {
      lazy: () =>
        import('./components/HcloudServerCard').then(m => m.HcloudServerCard),
    },
  }),
);

export const EntityHcloudServerContent = hcloudPlugin.provide(
  createComponentExtension({
    name: 'EntityHcloudServerContent',
    component: {
      lazy: () =>
        import('./components/HcloudServerContent').then(
          m => m.HcloudServerContent,
        ),
    },
  }),
);
```

- [ ] **Step 8: Create plugin.test.ts**

```typescript
import { hcloudPlugin } from './plugin';

describe('hcloud', () => {
  it('should export plugin', () => {
    expect(hcloudPlugin).toBeDefined();
    expect(hcloudPlugin.getId()).toBe('hcloud');
  });
});
```

- [ ] **Step 9: Create index.ts**

```typescript
export {
  hcloudPlugin,
  EntityHcloudServerCard,
  EntityHcloudServerContent,
} from './plugin';
export { hcloudApiRef } from './api';
export type { HcloudApi } from './api';
export { isHcloudServerAvailable } from './conditions';
```

- [ ] **Step 10: Create conditions.ts — entity predicate**

```typescript
// plugins/hcloud/src/conditions.ts
import { Entity } from '@backstage/catalog-model';
import { HCLOUD_SERVER_ANNOTATION } from '@proberaum/backstage-plugin-hcloud-common';

export function isHcloudServerAvailable(entity: Entity): boolean {
  return Boolean(entity.metadata.annotations?.[HCLOUD_SERVER_ANNOTATION]);
}
```

- [ ] **Step 11: Install dependencies and verify build**

Run: `cd /home/christoph/git/proberaum/backstage-plugins-hcloud/workspaces/hcloud && yarn install && cd plugins/hcloud && yarn build`
Expected: Build succeeds (lazy component imports won't fail at build time)

- [ ] **Step 12: Commit (components will follow in next tasks)**

```bash
git add plugins/hcloud/
git commit -m "feat(hcloud): add frontend plugin scaffold with API client, hooks, and conditions"
```

---

### Task 5: Frontend — Overview Card component

**Files:**
- Create: `plugins/hcloud/src/components/HcloudServerCard/HcloudServerCard.tsx`
- Create: `plugins/hcloud/src/components/HcloudServerCard/index.ts`
- Create: `plugins/hcloud/src/components/common/StatusBadge.tsx`
- Create: `plugins/hcloud/src/components/common/index.ts`

- [ ] **Step 1: Create StatusBadge.tsx — reusable status chip**

```typescript
// plugins/hcloud/src/components/common/StatusBadge.tsx
import React from 'react';
import { Chip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { HcloudServerStatus } from '@proberaum/backstage-plugin-hcloud-common';

const useStyles = makeStyles(theme => ({
  running: { backgroundColor: '#2e7d32', color: '#fff' },
  off: { backgroundColor: theme.palette.grey[600], color: '#fff' },
  error: { backgroundColor: theme.palette.error.main, color: '#fff' },
  transitioning: { backgroundColor: theme.palette.warning.main, color: '#fff' },
}));

function statusCategory(status: HcloudServerStatus): 'running' | 'off' | 'error' | 'transitioning' {
  switch (status) {
    case 'running':
      return 'running';
    case 'off':
      return 'off';
    case 'deleting':
    case 'unknown':
      return 'error';
    default:
      return 'transitioning';
  }
}

export function StatusBadge({ status }: { status: HcloudServerStatus }) {
  const classes = useStyles();
  const category = statusCategory(status);
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Chip
      label={label}
      size="small"
      className={classes[category]}
    />
  );
}
```

- [ ] **Step 2: Create common/index.ts**

```typescript
export { StatusBadge } from './StatusBadge';
```

- [ ] **Step 3: Create HcloudServerCard.tsx**

```typescript
// plugins/hcloud/src/components/HcloudServerCard/HcloudServerCard.tsx
import React from 'react';
import {
  Grid,
  LinearProgress,
  Typography,
  Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { InfoCard, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useServerDetails } from '../../hooks';
import { useServerMetrics } from '../../hooks';
import { StatusBadge } from '../common';

const useStyles = makeStyles(theme => ({
  label: {
    color: theme.palette.text.secondary,
    fontSize: '0.75rem',
  },
  value: {
    fontSize: '0.875rem',
  },
  barContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  bar: {
    flexGrow: 1,
    height: 6,
    borderRadius: 3,
  },
  barLabel: {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
    minWidth: 32,
  },
}));

function CpuBar({ value }: { value: number }) {
  const classes = useStyles();
  return (
    <Box>
      <Typography className={classes.label}>CPU</Typography>
      <Box className={classes.barContainer}>
        <LinearProgress
          variant="determinate"
          value={Math.min(value, 100)}
          className={classes.bar}
          style={{ backgroundColor: '#4caf5033' }}
        />
        <Typography className={classes.barLabel}>{Math.round(value)}%</Typography>
      </Box>
    </Box>
  );
}

export function HcloudServerCard() {
  const classes = useStyles();
  const { server, loading, error } = useServerDetails();
  const { metrics: cpuMetrics } = useServerMetrics('cpu', '1h');

  if (loading) {
    return <InfoCard title="Hetzner Cloud Server"><Progress /></InfoCard>;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (!server) {
    return null;
  }

  // CPU metrics from hcloud are 0-100 percentage
  const latestCpu = cpuMetrics?.timeSeries?.[0]?.values?.at(-1)?.value ?? 0;

  return (
    <InfoCard
      title="Hetzner Cloud Server"
      subheader={<StatusBadge status={server.status} />}
    >
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography className={classes.label}>Server</Typography>
          <Typography className={classes.value}>{server.name}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={classes.label}>Type</Typography>
          <Typography className={classes.value}>
            {server.server_type.name.toUpperCase()} ({server.server_type.cores} vCPU / {server.server_type.memory} GB)
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={classes.label}>Datacenter</Typography>
          <Typography className={classes.value}>{server.datacenter.name}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={classes.label}>IPv4</Typography>
          <Typography className={classes.value}>{server.public_net.ipv4.ip}</Typography>
        </Grid>
        <Grid item xs={12}>
          <CpuBar value={latestCpu} />
        </Grid>
      </Grid>
    </InfoCard>
  );
}
```

- [ ] **Step 4: Create HcloudServerCard/index.ts**

```typescript
export { HcloudServerCard } from './HcloudServerCard';
```

- [ ] **Step 5: Verify build**

Run: `cd plugins/hcloud && yarn build`
Expected: Build succeeds

- [ ] **Step 6: Commit**

```bash
git add plugins/hcloud/src/components/HcloudServerCard/ plugins/hcloud/src/components/common/
git commit -m "feat(hcloud): add overview card component with status badge and CPU bar"
```

---

### Task 6: Frontend — Dedicated Tab components

**Files:**
- Create: `plugins/hcloud/src/components/HcloudServerContent/HcloudServerContent.tsx`
- Create: `plugins/hcloud/src/components/HcloudServerContent/ServerHeader.tsx`
- Create: `plugins/hcloud/src/components/HcloudServerContent/ServerInfoCards.tsx`
- Create: `plugins/hcloud/src/components/HcloudServerContent/MetricsPanel.tsx`
- Create: `plugins/hcloud/src/components/HcloudServerContent/MetricsChart.tsx`
- Create: `plugins/hcloud/src/components/HcloudServerContent/VolumesTable.tsx`
- Create: `plugins/hcloud/src/components/HcloudServerContent/LabelsProtection.tsx`
- Create: `plugins/hcloud/src/components/HcloudServerContent/index.ts`

- [ ] **Step 1: Create ServerHeader.tsx**

```typescript
// plugins/hcloud/src/components/HcloudServerContent/ServerHeader.tsx
import React from 'react';
import { Box, Button, Typography, FormControlLabel, Switch } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import RefreshIcon from '@material-ui/icons/Refresh';
import { HcloudServerDetails } from '@proberaum/backstage-plugin-hcloud-common';
import { StatusBadge } from '../common';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  meta: {
    color: theme.palette.text.secondary,
    fontSize: '0.8rem',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));

export function ServerHeader(props: {
  server: HcloudServerDetails;
  project: string | undefined;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
}) {
  const classes = useStyles();
  const { server, project, autoRefresh, onToggleAutoRefresh, onRefresh } = props;

  return (
    <Box className={classes.root}>
      <Box className={classes.left}>
        <Typography variant="h5">{server.name}</Typography>
        <StatusBadge status={server.status} />
        <Typography className={classes.meta}>
          ID: {server.id}{project ? ` · Project: ${project}` : ''}
        </Typography>
      </Box>
      <Box className={classes.right}>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={autoRefresh}
              onChange={onToggleAutoRefresh}
            />
          }
          label="Auto-refresh"
        />
        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
        >
          Refresh
        </Button>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: Create ServerInfoCards.tsx**

```typescript
// plugins/hcloud/src/components/HcloudServerContent/ServerInfoCards.tsx
import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { InfoCard } from '@backstage/core-components';
import { HcloudServerDetails } from '@proberaum/backstage-plugin-hcloud-common';

const useStyles = makeStyles(theme => ({
  label: {
    color: theme.palette.text.secondary,
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    marginBottom: theme.spacing(0.5),
  },
  primary: {
    fontSize: '0.95rem',
    fontWeight: 500,
  },
  secondary: {
    color: theme.palette.text.secondary,
    fontSize: '0.8rem',
  },
}));

export function ServerInfoCards({ server }: { server: HcloudServerDetails }) {
  const classes = useStyles();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <InfoCard title="Server Type" variant="gridItem">
          <Typography className={classes.primary}>
            {server.server_type.name.toUpperCase()}
          </Typography>
          <Typography className={classes.secondary}>
            {server.server_type.cores} vCPU · {server.server_type.memory} GB RAM · {server.server_type.disk} GB disk
          </Typography>
        </InfoCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <InfoCard title="Location" variant="gridItem">
          <Typography className={classes.primary}>
            {server.datacenter.name}
          </Typography>
          <Typography className={classes.secondary}>
            {server.datacenter.location.city}, {server.datacenter.location.country}
          </Typography>
        </InfoCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <InfoCard title="Image" variant="gridItem">
          <Typography className={classes.primary}>
            {server.image?.description ?? 'None'}
          </Typography>
          <Typography className={classes.secondary}>
            {server.image ? `Created: ${new Date(server.image.created).toLocaleDateString()}` : ''}
          </Typography>
        </InfoCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <InfoCard title="Networking" variant="gridItem">
          <Typography className={classes.primary}>
            {server.public_net.ipv4.ip}
          </Typography>
          <Typography className={classes.secondary}>
            IPv6: {server.public_net.ipv6.ip ? server.public_net.ipv6.ip.substring(0, 20) + '...' : 'None'}
          </Typography>
        </InfoCard>
      </Grid>
    </Grid>
  );
}
```

- [ ] **Step 3: Create MetricsChart.tsx — single chart using recharts**

```typescript
// plugins/hcloud/src/components/HcloudServerContent/MetricsChart.tsx
import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { HcloudTimeSeries } from '@proberaum/backstage-plugin-hcloud-common';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1.5),
  },
  title: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
}));

const COLORS = ['#4caf50', '#f44336', '#2196f3', '#ff9800', '#9c27b0', '#00bcd4'];

export function MetricsChart(props: {
  title: string;
  timeSeries: HcloudTimeSeries[];
  loading?: boolean;
}) {
  const classes = useStyles();
  const { title, timeSeries, loading } = props;

  if (loading || timeSeries.length === 0) {
    return (
      <Box className={classes.root}>
        <Typography className={classes.title}>{title}</Typography>
        <Typography variant="body2" color="textSecondary">
          {loading ? 'Loading...' : 'No data'}
        </Typography>
      </Box>
    );
  }

  // Merge all series into a single data array keyed by timestamp
  const dataMap = new Map<number, Record<string, number>>();
  for (const series of timeSeries) {
    for (const { timestamp, value } of series.values) {
      const existing = dataMap.get(timestamp) ?? { timestamp };
      existing[series.name] = value;
      dataMap.set(timestamp, existing);
    }
  }
  const data = Array.from(dataMap.values()).sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  return (
    <Box className={classes.root}>
      <Typography className={classes.title}>{title}</Typography>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data}>
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={ts =>
              new Date(ts * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            }
            tick={{ fontSize: 10 }}
          />
          <YAxis tick={{ fontSize: 10 }} width={40} />
          <Tooltip
            labelFormatter={ts =>
              new Date((ts as number) * 1000).toLocaleString()
            }
          />
          {timeSeries.map((series, i) => (
            <Line
              key={series.name}
              type="monotone"
              dataKey={series.name}
              stroke={COLORS[i % COLORS.length]}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
```

- [ ] **Step 4: Create MetricsPanel.tsx — metrics section with time range selector**

```typescript
// plugins/hcloud/src/components/HcloudServerContent/MetricsPanel.tsx
import React, { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { InfoCard } from '@backstage/core-components';
import { HcloudTimeRange } from '@proberaum/backstage-plugin-hcloud-common';
import { useServerMetrics } from '../../hooks';
import { MetricsChart } from './MetricsChart';

const useStyles = makeStyles(theme => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
}));

const TIME_RANGES: HcloudTimeRange[] = ['1h', '6h', '24h', '7d', '30d'];

export function MetricsPanel({ refreshKey }: { refreshKey?: number }) {
  const classes = useStyles();
  const [range, setRange] = useState<HcloudTimeRange>('1h');

  const cpu = useServerMetrics('cpu', range);
  const disk = useServerMetrics('disk', range);
  const network = useServerMetrics('network', range);

  // Re-fetch metrics when refreshKey changes (from auto-refresh or manual refresh)
  useEffect(() => {
    if (refreshKey && refreshKey > 0) {
      cpu.refresh();
      disk.refresh();
      network.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <Box>
      <Box className={classes.header}>
        <Typography variant="h6">Metrics</Typography>
        <ButtonGroup size="small" variant="outlined">
          {TIME_RANGES.map(r => (
            <Button
              key={r}
              onClick={() => setRange(r)}
              variant={r === range ? 'contained' : 'outlined'}
              color={r === range ? 'primary' : 'default'}
            >
              {r}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <InfoCard title="" variant="gridItem">
            <MetricsChart
              title="CPU Usage"
              timeSeries={cpu.metrics?.timeSeries ?? []}
              loading={cpu.loading}
            />
          </InfoCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <InfoCard title="" variant="gridItem">
            <MetricsChart
              title="Disk I/O"
              timeSeries={disk.metrics?.timeSeries ?? []}
              loading={disk.loading}
            />
          </InfoCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <InfoCard title="" variant="gridItem">
            <MetricsChart
              title="Network"
              timeSeries={network.metrics?.timeSeries ?? []}
              loading={network.loading}
            />
          </InfoCard>
        </Grid>
      </Grid>
    </Box>
  );
}
```

- [ ] **Step 5: Create VolumesTable.tsx**

```typescript
// plugins/hcloud/src/components/HcloudServerContent/VolumesTable.tsx
import React from 'react';
import { Table, TableColumn } from '@backstage/core-components';
import { HcloudVolume } from '@proberaum/backstage-plugin-hcloud-common';

const columns: TableColumn<HcloudVolume>[] = [
  { title: 'Name', field: 'name' },
  { title: 'Size (GB)', field: 'size', type: 'numeric' },
  { title: 'Format', field: 'format' },
  { title: 'Device', field: 'linux_device' },
];

export function VolumesTable({ volumes }: { volumes: HcloudVolume[] }) {
  if (volumes.length === 0) {
    return null;
  }

  return (
    <Table
      title="Volumes"
      options={{ search: false, paging: false, padding: 'dense' }}
      columns={columns}
      data={volumes}
    />
  );
}
```

- [ ] **Step 6: Create LabelsProtection.tsx**

```typescript
// plugins/hcloud/src/components/HcloudServerContent/LabelsProtection.tsx
import React from 'react';
import { Box, Chip, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { InfoCard } from '@backstage/core-components';
import { HcloudServerDetails } from '@proberaum/backstage-plugin-hcloud-common';

const useStyles = makeStyles(theme => ({
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
    marginBottom: theme.spacing(1),
  },
  protectionLine: {
    fontSize: '0.85rem',
  },
  enabled: {
    color: '#4caf50',
  },
  disabled: {
    color: theme.palette.text.secondary,
  },
}));

function ProtectionStatus({ label, enabled }: { label: string; enabled: boolean }) {
  const classes = useStyles();
  return (
    <Typography className={classes.protectionLine}>
      {label}:{' '}
      <span className={enabled ? classes.enabled : classes.disabled}>
        {enabled ? 'enabled' : 'disabled'}
      </span>
    </Typography>
  );
}

export function LabelsProtection({ server }: { server: HcloudServerDetails }) {
  const classes = useStyles();
  const labelEntries = Object.entries(server.labels);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <InfoCard title="Labels" variant="gridItem">
          {labelEntries.length > 0 ? (
            <Box className={classes.chipContainer}>
              {labelEntries.map(([k, v]) => (
                <Chip key={k} label={`${k}=${v}`} size="small" variant="outlined" />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No labels
            </Typography>
          )}
        </InfoCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <InfoCard title="Protection & Backups" variant="gridItem">
          <ProtectionStatus label="Delete protection" enabled={server.protection.delete} />
          <ProtectionStatus label="Rebuild protection" enabled={server.protection.rebuild} />
          <ProtectionStatus label="Backups" enabled={server.backup_window !== null} />
          {server.backup_window && (
            <Typography variant="body2" color="textSecondary">
              Backup window: {server.backup_window}
            </Typography>
          )}
        </InfoCard>
      </Grid>
    </Grid>
  );
}
```

- [ ] **Step 7: Create HcloudServerContent.tsx — main tab layout with auto-refresh**

```typescript
// plugins/hcloud/src/components/HcloudServerContent/HcloudServerContent.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import { HCLOUD_PROJECT_ANNOTATION } from '@proberaum/backstage-plugin-hcloud-common';
import { useServerDetails } from '../../hooks';
import { ServerHeader } from './ServerHeader';
import { ServerInfoCards } from './ServerInfoCards';
import { MetricsPanel } from './MetricsPanel';
import { VolumesTable } from './VolumesTable';
import { LabelsProtection } from './LabelsProtection';

const AUTO_REFRESH_INTERVAL = 30_000;

const useStyles = makeStyles(theme => ({
  section: {
    marginTop: theme.spacing(2),
  },
}));

export function HcloudServerContent() {
  const classes = useStyles();
  const { entity } = useEntity();
  const { server, loading, error, refresh } = useServerDetails();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const project =
    entity.metadata.annotations?.[HCLOUD_PROJECT_ANNOTATION];

  const triggerRefresh = useCallback(() => {
    refresh();
    setRefreshKey(k => k + 1);
  }, [refresh]);

  // Auto-refresh with visibility API
  const setupInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        if (!document.hidden) {
          triggerRefresh();
        }
      }, AUTO_REFRESH_INTERVAL);
    }
  }, [autoRefresh, triggerRefresh]);

  useEffect(() => {
    setupInterval();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [setupInterval]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (!server) {
    return null;
  }

  return (
    <Box>
      <ServerHeader
        server={server}
        project={project}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh(prev => !prev)}
        onRefresh={triggerRefresh}
      />
      <ServerInfoCards server={server} />
      <Box className={classes.section}>
        <MetricsPanel refreshKey={refreshKey} />
      </Box>
      <Box className={classes.section}>
        <VolumesTable volumes={server.volumes} />
      </Box>
      <Box className={classes.section}>
        <LabelsProtection server={server} />
      </Box>
    </Box>
  );
}
```

- [ ] **Step 8: Create HcloudServerContent/index.ts**

```typescript
export { HcloudServerContent } from './HcloudServerContent';
```

- [ ] **Step 9: Verify frontend plugin builds**

Run: `cd plugins/hcloud && yarn build`
Expected: Build succeeds

- [ ] **Step 10: Commit**

```bash
git add plugins/hcloud/src/components/
git commit -m "feat(hcloud): add overview card and dedicated tab components with metrics charts"
```

---

## Chunk 3: Catalog Module + Integration

### Task 7: Catalog Entity Provider module

**Files:**
- Create: `plugins/hcloud-module-catalog/package.json`
- Create: `plugins/hcloud-module-catalog/tsconfig.json`
- Create: `plugins/hcloud-module-catalog/src/index.ts`
- Create: `plugins/hcloud-module-catalog/src/module.ts`
- Create: `plugins/hcloud-module-catalog/src/provider/HcloudEntityProvider.ts`
- Create: `plugins/hcloud-module-catalog/src/provider/HcloudEntityProvider.test.ts`
- Create: `plugins/hcloud-module-catalog/src/provider/index.ts`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@proberaum/backstage-plugin-hcloud-module-catalog",
  "version": "0.1.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "license": "Apache-2.0",
  "publishConfig": {
    "access": "public",
    "main": "dist/index.cjs.js",
    "types": "dist/index.d.ts"
  },
  "backstage": {
    "role": "backend-plugin-module",
    "pluginId": "catalog",
    "pluginPackage": "@backstage/plugin-catalog-backend",
    "pluginPackages": [
      "@proberaum/backstage-plugin-hcloud",
      "@proberaum/backstage-plugin-hcloud-backend",
      "@proberaum/backstage-plugin-hcloud-common",
      "@proberaum/backstage-plugin-hcloud-module-catalog"
    ]
  },
  "scripts": {
    "start": "backstage-cli package start",
    "build": "backstage-cli package build",
    "lint": "backstage-cli package lint",
    "test": "backstage-cli package test",
    "clean": "backstage-cli package clean",
    "prepack": "backstage-cli package prepack",
    "postpack": "backstage-cli package postpack"
  },
  "dependencies": {
    "@backstage/backend-plugin-api": "^1.7.0",
    "@backstage/config": "^1.3.6",
    "@backstage/plugin-catalog-node": "^1.17.0",
    "@proberaum/backstage-plugin-hcloud-backend": "workspace:^",
    "@proberaum/backstage-plugin-hcloud-common": "workspace:^"
  },
  "devDependencies": {
    "@backstage/backend-test-utils": "^1.7.0",
    "@backstage/cli": "^0.35.4"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "extends": "@backstage/cli/config/tsconfig.json",
  "include": ["src"],
  "exclude": ["node_modules"],
  "compilerOptions": {
    "outDir": "dist-types",
    "rootDir": "."
  }
}
```

- [ ] **Step 3: Create HcloudEntityProvider.ts**

```typescript
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
          minutes: scheduleConfig
            .getConfig('frequency')
            .getNumber('minutes'),
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
```

- [ ] **Step 4: Write test for entity provider**

```typescript
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd plugins/hcloud-module-catalog && yarn test`
Expected: PASS

- [ ] **Step 6: Create provider/index.ts**

```typescript
export { HcloudEntityProvider } from './HcloudEntityProvider';
```

- [ ] **Step 7: Create module.ts**

```typescript
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import { hcloudServiceRef } from '@proberaum/backstage-plugin-hcloud-backend';
import { HcloudEntityProvider } from './provider';

export const catalogModuleHcloud = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'hcloud',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        scheduler: coreServices.scheduler,
        catalog: catalogProcessingExtensionPoint,
        hcloudService: hcloudServiceRef,
      },
      async init({ logger, config, scheduler, catalog, hcloudService }) {
        const provider = new HcloudEntityProvider({
          config,
          hcloudService,
          logger,
          scheduler,
        });
        catalog.addEntityProvider(provider);
        logger.info('Registered hcloud catalog entity provider');
      },
    });
  },
});
```

- [ ] **Step 8: Create index.ts**

```typescript
export { catalogModuleHcloud as default } from './module';
```

- [ ] **Step 9: Commit**

```bash
git add plugins/hcloud-module-catalog/
git commit -m "feat(hcloud): add catalog entity provider module for importing servers"
```

---

### Task 8: Integration — wire up in app and backend

**Files:**
- Modify: `packages/backend/package.json` — add hcloud-backend and module-catalog deps
- Modify: `packages/backend/src/index.ts` — register backend plugins
- Modify: `packages/app/package.json` — add hcloud frontend dep
- Modify: `packages/app/src/components/catalog/EntityPage.tsx` — add card and tab
- Modify: `app-config.yaml` — add hcloud config section
- Modify: `examples/entities.yaml` — add example entity with hcloud annotation

- [ ] **Step 1: Add backend dependencies to packages/backend/package.json**

Add to `dependencies`:
```json
"@proberaum/backstage-plugin-hcloud-backend": "workspace:^",
"@proberaum/backstage-plugin-hcloud-module-catalog": "workspace:^"
```

- [ ] **Step 2: Register backend plugins in packages/backend/src/index.ts**

Add before `backend.start()`:
```typescript
// hcloud
backend.add(import('@proberaum/backstage-plugin-hcloud-backend'));
backend.add(import('@proberaum/backstage-plugin-hcloud-module-catalog'));
```

- [ ] **Step 3: Add frontend dependency to packages/app/package.json**

Add to `dependencies`:
```json
"@proberaum/backstage-plugin-hcloud": "workspace:^"
```

- [ ] **Step 4: Add card and tab to EntityPage.tsx**

Add imports:
```typescript
import {
  EntityHcloudServerCard,
  EntityHcloudServerContent,
  isHcloudServerAvailable,
} from '@proberaum/backstage-plugin-hcloud';
```

Add the overview card and dedicated tab to **both** `defaultEntityPage` and `resourceEntityPage` layouts (since imported servers are `Resource` kind, and manually annotated entities can be any kind):

In each entity page's overview content section (wherever `EntityAboutCard` is rendered), add the card:
```tsx
<EntitySwitch>
  <EntitySwitch.Case if={isHcloudServerAvailable}>
    <Grid item md={6}>
      <EntityHcloudServerCard />
    </Grid>
  </EntitySwitch.Case>
</EntitySwitch>
```

In each `EntityLayout`, add the dedicated tab:
```tsx
<EntityLayout.Route
  path="/hcloud"
  title="Hcloud"
  if={isHcloudServerAvailable}
>
  <EntityHcloudServerContent />
</EntityLayout.Route>
```

Repeat for `serviceEntityPage`, `websiteEntityPage`, and `resourceEntityPage` layouts that exist in the file. The `isHcloudServerAvailable` predicate ensures the card/tab only appear when the annotation is present.

- [ ] **Step 5: Add hcloud config to app-config.yaml**

```yaml
hcloud:
  projects:
    default:
      token: ${HCLOUD_TOKEN}
  defaultProject: default
  cache:
    ttl: 30
    metricsTtl: 60
```

- [ ] **Step 6: Add example entity with hcloud annotation to examples/entities.yaml**

```yaml
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: example-hcloud-server
  annotations:
    hcloud/server: "web-prod-01"
spec:
  type: service
  lifecycle: production
  owner: guests
```

- [ ] **Step 7: Run yarn install to link workspace packages**

Run: `cd /home/christoph/git/proberaum/backstage-plugins-hcloud/workspaces/hcloud && yarn install`
Expected: Install succeeds, all workspace links resolved

- [ ] **Step 8: Verify full build**

Run: `yarn build:all`
Expected: All packages build successfully

- [ ] **Step 9: Run all tests**

Run: `yarn test:all`
Expected: All tests pass

- [ ] **Step 10: Commit**

```bash
git add packages/ app-config.yaml examples/
git commit -m "feat(hcloud): integrate frontend and backend plugins into app"
```
