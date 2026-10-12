import { isValidConnectionProviderAllowedVisibilities } from '@/application/utils/isValidConnectionProviderAllowedVisibilities';

describe('isValidConnectionProviderAllowedVisibilities', () => {
  it.each([
    { allowedVisibilities: ['user'] },
    { allowedVisibilities: ['workspace'] },
    { allowedVisibilities: ['user', 'workspace'] },
    { allowedVisibilities: ['workspace', 'user'] },
  ])('should accept $allowedVisibilities', ({ allowedVisibilities }) => {
    expect(
      isValidConnectionProviderAllowedVisibilities(allowedVisibilities),
    ).toBe(true);
  });

  it.each([
    { title: 'an empty list', allowedVisibilities: [] },
    { title: 'duplicate choices', allowedVisibilities: ['user', 'user'] },
    { title: 'an unknown choice', allowedVisibilities: ['workspace', 'team'] },
    { title: 'uppercase values', allowedVisibilities: ['USER'] },
    { title: 'a string', allowedVisibilities: 'user' },
    { title: 'null', allowedVisibilities: null },
    { title: 'undefined', allowedVisibilities: undefined },
    { title: 'a non-string entry', allowedVisibilities: ['workspace', 1] },
  ])('should reject $title', ({ allowedVisibilities }) => {
    expect(
      isValidConnectionProviderAllowedVisibilities(allowedVisibilities),
    ).toBe(false);
  });
});
