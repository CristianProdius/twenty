import { normalizeSendMessageRecipients } from 'src/modules/messaging/message-outbound-manager/utils/normalize-send-message-recipients.util';

describe('normalizeSendMessageRecipients', () => {
  it('returns an empty list when recipients are missing', () => {
    expect(normalizeSendMessageRecipients(undefined)).toEqual([]);
  });

  it('normalizes a single recipient string', () => {
    expect(normalizeSendMessageRecipients('tg:123')).toEqual(['tg:123']);
  });

  it('splits comma-separated values and trims whitespace', () => {
    expect(normalizeSendMessageRecipients('tg:123, tg:456')).toEqual([
      'tg:123',
      'tg:456',
    ]);
  });

  it('flattens recipient arrays', () => {
    expect(normalizeSendMessageRecipients(['tg:123', 'tg:456, tg:789'])).toEqual(
      ['tg:123', 'tg:456', 'tg:789'],
    );
  });
});
