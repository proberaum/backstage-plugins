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
