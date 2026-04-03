import { sanitizeAnalyticsPageEvent } from '@/lib/analytics';

describe('portfolio analytics event sanitization', () => {
  it('strips query params and fragments from tracked urls', () => {
    const event = sanitizeAnalyticsPageEvent({
      name: 'pageview',
      url: 'https://portfolio.test/projects/grime-time?email=ops%40grimetime.app#details',
    });

    expect(event).toEqual({
      name: 'pageview',
      url: 'https://portfolio.test/projects/grime-time',
    });
  });

  it('drops admin and auth routes', () => {
    expect(
      sanitizeAnalyticsPageEvent({
        url: 'https://portfolio.test/admin?tab=users',
      }),
    ).toBeNull();

    expect(
      sanitizeAnalyticsPageEvent({
        url: 'https://portfolio.test/login?next=%2Fadmin',
      }),
    ).toBeNull();
  });

  it('drops paths that look like they include an email address', () => {
    expect(
      sanitizeAnalyticsPageEvent({
        url: 'https://portfolio.test/contact/ops@grimetime.app',
      }),
    ).toBeNull();
  });
});
