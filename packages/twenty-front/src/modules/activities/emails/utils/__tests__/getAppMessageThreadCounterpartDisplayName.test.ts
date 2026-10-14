import { getAppMessageThreadCounterpartDisplayName } from '@/activities/emails/utils/getAppMessageThreadCounterpartDisplayName';
import { MessageParticipantRole } from 'twenty-shared/types';

describe('getAppMessageThreadCounterpartDisplayName', () => {
  it('prefers the linked person full name', () => {
    expect(
      getAppMessageThreadCounterpartDisplayName({
        participant: {
          displayName: 'maria_tg',
          handle: 'tg:123',
          role: MessageParticipantRole.FROM,
          person: {
            name: {
              firstName: 'Maria',
              lastName: 'Ceban',
            },
          },
        } as never,
      }),
    ).toBe('Maria Ceban');
  });

  it('falls back to displayName when there is no person name', () => {
    expect(
      getAppMessageThreadCounterpartDisplayName({
        participant: {
          displayName: 'Maria C.',
          handle: 'tg:123',
          role: MessageParticipantRole.FROM,
          person: null,
        } as never,
      }),
    ).toBe('Maria C.');
  });

  it('falls back to handle when person name and displayName are empty', () => {
    expect(
      getAppMessageThreadCounterpartDisplayName({
        participant: {
          displayName: '',
          handle: 'tg:123',
          role: MessageParticipantRole.FROM,
          person: null,
        } as never,
      }),
    ).toBe('tg:123');
  });

  it('returns an empty string when the participant is missing', () => {
    expect(
      getAppMessageThreadCounterpartDisplayName({ participant: null }),
    ).toBe('');
  });
});
