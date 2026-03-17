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
        description: 'Falkenstein',
        country: 'DE',
        city: 'Falkenstein',
      },
    },
    public_net: {
      ipv4: { ip: '1.2.3.4', blocked: false },
      ipv6: { ip: '::1', blocked: false },
      floating_ips: [],
      firewalls: [],
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
