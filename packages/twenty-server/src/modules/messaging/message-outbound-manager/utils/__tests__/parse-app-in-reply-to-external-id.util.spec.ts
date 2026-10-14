import { parseAppInReplyToExternalId } from 'src/modules/messaging/message-outbound-manager/utils/parse-app-in-reply-to-external-id.util';

describe('parseAppInReplyToExternalId', () => {
  const applicationId = 'app-1';
  const messageChannelId = 'channel-1';

  it('returns undefined when inReplyTo is missing', () => {
    expect(
      parseAppInReplyToExternalId({
        applicationId,
        messageChannelId,
      }),
    ).toBeUndefined();
  });

  it('strips the app header prefix to recover the provider external id', () => {
    expect(
      parseAppInReplyToExternalId({
        inReplyTo: 'app:app-1:channel-1:telegram_bot:123:42',
        applicationId,
        messageChannelId,
      }),
    ).toBe('telegram_bot:123:42');
  });

  it('returns the raw value when it is not an app header id', () => {
    expect(
      parseAppInReplyToExternalId({
        inReplyTo: 'telegram_bot:123:42',
        applicationId,
        messageChannelId,
      }),
    ).toBe('telegram_bot:123:42');
  });
});
