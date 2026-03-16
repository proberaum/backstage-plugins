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
