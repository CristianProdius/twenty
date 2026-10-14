import { getMessageThreadDisplayTitle } from '@/activities/emails/utils/getMessageThreadDisplayTitle';

describe('getMessageThreadDisplayTitle', () => {
  it('keeps a non-empty email subject', () => {
    expect(
      getMessageThreadDisplayTitle({
        subject: 'Quarterly update',
        isAppChannel: false,
        counterpartDisplayName: 'Maria Ceban',
      }),
    ).toBe('Quarterly update');
  });

  it('keeps a non-empty subject even for APP channels', () => {
    expect(
      getMessageThreadDisplayTitle({
        subject: 'Pinned title',
        isAppChannel: true,
        counterpartDisplayName: 'Maria Ceban',
      }),
    ).toBe('Pinned title');
  });

  it('uses the counterpart display name for APP threads without a subject', () => {
    expect(
      getMessageThreadDisplayTitle({
        subject: '',
        isAppChannel: true,
        counterpartDisplayName: 'Maria Ceban',
      }),
    ).toBe('Maria Ceban');
  });

  it('returns empty for email threads without a subject', () => {
    expect(
      getMessageThreadDisplayTitle({
        subject: '   ',
        isAppChannel: false,
        counterpartDisplayName: 'Maria Ceban',
      }),
    ).toBe('');
  });

  it('returns empty for APP threads when the counterpart name is missing', () => {
    expect(
      getMessageThreadDisplayTitle({
        subject: null,
        isAppChannel: true,
        counterpartDisplayName: '',
      }),
    ).toBe('');
  });
});
