import { hcloudPlugin } from './plugin';

describe('hcloud', () => {
  it('should export plugin', () => {
    expect(hcloudPlugin).toBeDefined();
    expect(hcloudPlugin.getId()).toBe('hcloud');
  });
});
