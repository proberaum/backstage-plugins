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
