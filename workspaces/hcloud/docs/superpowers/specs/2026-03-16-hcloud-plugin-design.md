# Hetzner Cloud (hcloud) Backstage Plugin — Design Spec

## Overview

A Backstage plugin for Hetzner Cloud that provides server status visibility on any catalog entity page and optional server import into the Backstage catalog.

**Primary goal:** Show hcloud server status (details, metrics, volumes, labels) for any entity annotated with `hcloud/server`.

**Secondary goal:** Optional catalog entity provider that imports hcloud servers as `Resource` entities.

## Package Structure

Four packages under `plugins/`, following Backstage conventions with `@proberaum` scope:

| Package | Backstage Role | Purpose |
|---------|---------------|---------|
| `plugins/hcloud` (`@proberaum/backstage-plugin-hcloud`) | `frontend-plugin` | Overview card + dedicated entity page tab |
| `plugins/hcloud-backend` (`@proberaum/backstage-plugin-hcloud-backend`) | `backend-plugin` | API routes, hcloud client, caching, multi-project token management |
| `plugins/hcloud-common` (`@proberaum/backstage-plugin-hcloud-common`) | `common-library` | Shared types, annotation constants, utilities |
| `plugins/hcloud-module-catalog` (`@proberaum/backstage-plugin-hcloud-module-catalog`) | `backend-plugin-module` | Optional catalog entity provider for importing servers |

### Dependency graph

```
hcloud (frontend) ──> hcloud-common
hcloud-backend ──> hcloud-common
hcloud-module-catalog ──> hcloud-backend (shared hcloud client)
hcloud-module-catalog ──> hcloud-common
```

## Configuration

### `app-config.yaml`

```yaml
hcloud:
  projects:
    prod:
      token: ${HCLOUD_PROD_TOKEN}
    staging:
      token: ${HCLOUD_STAGING_TOKEN}
  defaultProject: prod         # used when entity has no hcloud/project annotation
  cache:
    ttl: 30                    # seconds, server details cache TTL
    metricsTtl: 60             # seconds, metrics data cache TTL
```

**Validation rules:**
- At least one project must be configured.
- `defaultProject` must reference a defined project key.
- If an entity's `hcloud/project` annotation references an unknown project, the frontend shows an error.

### Entity Annotations

```yaml
metadata:
  annotations:
    hcloud/server: "12345"          # by server ID (numeric)
    hcloud/server: "web-prod-01"    # or by server name (non-numeric)
    hcloud/project: "staging"       # optional, falls back to defaultProject
```

- `hcloud/server` — required for the frontend plugin to activate. Auto-detected: numeric values are treated as server IDs, non-numeric as server names.
- `hcloud/project` — optional. Selects which configured project token to use. Falls back to `defaultProject`.

## Backend Plugin (`hcloud-backend`)

### API Routes

All routes are under `/api/hcloud`.

#### `GET /api/hcloud/servers/:ref`

Returns full server details.

- `:ref` — server ID (numeric) or server name (resolved to ID via hcloud API)
- Query params: `?project=<key>` (optional, defaults to `defaultProject`)
- Response: server status, type, datacenter, IPs, image, created date, labels, volumes, protection settings, backup status

#### `GET /api/hcloud/servers/:ref/metrics`

Returns time series metrics data.

- `:ref` — server ID or name
- Query params:
  - `project=<key>` (optional)
  - `type=cpu|disk|network` (required)
  - `start=<ISO 8601>` (required)
  - `end=<ISO 8601>` (required)
  - `step=<seconds>` (required)
- Response: array of time series data points

### Hcloud Client Layer

- Wraps the official `hcloud-js` npm package (Hetzner's TypeScript SDK).
- One client instance per configured project, created lazily on first use.
- Caching layer between API routes and the hcloud client:
  - Server details: cached by `(project, serverId)`, TTL from config (default 30s).
  - Name-to-ID resolution: cached by `(project, serverName)`, same TTL.
  - Metrics: cached by `(project, serverId, type, start, end, step)`, separate TTL (default 60s).
- Uses Backstage's built-in `CacheManager` for cache storage.

### Error Handling

| Condition | HTTP Status | Behavior |
|-----------|-------------|----------|
| Unknown project key | 400 | Message listing valid project keys |
| Server not found | 404 | Clear message |
| hcloud API error | Forwarded | Appropriate HTTP status from upstream |
| Invalid/expired token | 502 | Clear message, no token leakage |

## Frontend Plugin (`hcloud`)

### Exported Components

```typescript
// Plugin instance
export const hcloudPlugin = createPlugin({ ... });

// Overview card — compact, for entity page overview tab
export const EntityHcloudServerCard = hcloudPlugin.provide(
  createComponentExtension({ ... })
);

// Dedicated tab content — full dashboard
export const EntityHcloudServerContent = hcloudPlugin.provide(
  createComponentExtension({ ... })
);

// Conditional — only renders when hcloud/server annotation is present
export const isHcloudServerAvailable = isPluginApplicableToEntity(
  entity => Boolean(entity.metadata.annotations?.['hcloud/server'])
);
```

### Usage in `EntityPage.tsx`

```tsx
// Overview tab — card alongside other info cards
<EntitySwitch>
  <EntitySwitch.Case if={isHcloudServerAvailable}>
    <EntityHcloudServerCard />
  </EntitySwitch.Case>
</EntitySwitch>

// Dedicated tab
<EntityLayout.Route path="/hcloud" title="Hcloud" if={isHcloudServerAvailable}>
  <EntityHcloudServerContent />
</EntityLayout.Route>
```

### Overview Card

Compact card showing:
- Server name and status badge (Running / Off / Rebuilding / etc.)
- Server type (vCPU / RAM specs)
- Datacenter
- IPv4 address
- CPU, RAM, disk utilization bars (current percentage)

### Dedicated Tab

Full dashboard layout:

1. **Server header** — name, status badge, server ID, project key, refresh button, auto-refresh toggle (configurable interval, default 30s)
2. **Info cards grid** (4 columns) — server type + specs, location + datacenter, image + creation date, networking (IPv4/IPv6)
3. **Metrics panel** — time range selector (1h, 6h, 24h, 7d, 30d) with 4 chart components:
   - CPU usage
   - Memory usage
   - Disk I/O (read/write)
   - Network traffic (in/out)
4. **Volumes table** — attached volumes with name, size, filesystem
5. **Labels & protection** — hcloud labels as tags, delete/rebuild protection status, backup status + next scheduled backup

### Internal Components

- `HcloudServerCard` — overview card component
- `HcloudServerContent` — tab layout, composes sub-components:
  - `ServerHeader`
  - `ServerInfoCards`
  - `MetricsPanel`
  - `VolumesTable`
  - `LabelsProtection`
- `useServerDetails(ref, project)` — hook, calls backend API, manages loading/error states
- `useServerMetrics(ref, project, type, timeRange)` — hook for metrics data

### Auto-Refresh

- Configurable interval (default 30s)
- Pauses when tab/browser is not visible (visibility API)
- Manual refresh button always available

### Error States

| Condition | Behavior |
|-----------|----------|
| Missing `hcloud/server` annotation | Component not rendered (via `isHcloudServerAvailable`) |
| Unknown project | Error card with message |
| Server not found | Error card suggesting annotation value may be wrong |
| Backend unreachable | Error card with retry button |

## Catalog Entity Provider (`hcloud-module-catalog`)

Optional backend module that imports hcloud servers as Backstage `Resource` entities.

### Produced Entity Shape

```yaml
apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  name: hcloud-<project>-<server-name>    # e.g. hcloud-prod-web-prod-01
  annotations:
    hcloud/server: "<server-id>"
    hcloud/project: "<project-key>"
  labels:                                  # mapped from hcloud labels
    hcloud.io/env: "production"
    hcloud.io/team: "platform"
spec:
  type: hcloud-server
  owner: <configurable default>
  lifecycle: <configurable default>
```

### Configuration

```yaml
catalog:
  providers:
    hcloud:
      prod:                                # matches project key from hcloud.projects
        schedule:
          frequency: { minutes: 5 }
          timeout: { minutes: 3 }
        filters:                           # optional: only import matching servers
          labels:
            managed: "true"
        defaults:
          owner: group:platform-team
          lifecycle: production
      # staging:
      #   schedule: ...
```

### Behavior

- Runs on configurable schedule per project.
- Full replacement on each sync (standard Backstage `EntityProvider` pattern).
- Filters by hcloud labels to control which servers get imported.
- Configurable default `owner` and `lifecycle` per project.
- Server hcloud labels are mapped to Backstage entity labels with `hcloud.io/` prefix to avoid collisions.
- Imported entities automatically get `hcloud/server` and `hcloud/project` annotations, so the frontend plugin works on them without additional configuration.
- Uses the shared hcloud client from `hcloud-backend`.
