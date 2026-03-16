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
