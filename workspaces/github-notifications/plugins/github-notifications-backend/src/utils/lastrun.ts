import { CacheService } from '@backstage/backend-plugin-api';

const prefix = 'github module:';

export async function getSince(
  cache: CacheService,
  repo: string,
): Promise<Date> {
  const since = await cache.get<string>(`${prefix}${repo}`);
  if (!since) {
    // start one month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return oneMonthAgo;
  }
  return new Date(since);
}

export async function setSince(
  cache: CacheService,
  repo: string,
  until: Date,
): Promise<void> {
  return cache.set(`${prefix}${repo}`, until.toISOString(), {
    ttl: { years: 1 },
  });
}
