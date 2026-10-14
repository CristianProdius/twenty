import { getAppReplyToHandle } from '@/activities/emails/utils/getAppReplyToHandle';
import { MessageParticipantRole } from 'twenty-shared/types';

describe('getAppReplyToHandle', () => {
  it('returns the sender handle for an incoming message', () => {
    expect(
      getAppReplyToHandle({
        connectedAccountHandle: 'tg-bot:school',
        message: {
          sender: {
            handle: 'tg:123',
            role: MessageParticipantRole.FROM,
          },
          messageParticipants: [
            {
              handle: 'tg:123',
              role: MessageParticipantRole.FROM,
            },
            {
              handle: 'tg-bot:school',
              role: MessageParticipantRole.TO,
            },
          ],
        } as never,
      }),
    ).toBe('tg:123');
  });

  it('returns the other participant when the last message was outgoing', () => {
    expect(
      getAppReplyToHandle({
        connectedAccountHandle: 'tg-bot:school',
        message: {
          sender: {
            handle: 'tg-bot:school',
            role: MessageParticipantRole.FROM,
          },
          messageParticipants: [
            {
              handle: 'tg-bot:school',
              role: MessageParticipantRole.FROM,
            },
            {
              handle: 'tg:123',
              role: MessageParticipantRole.TO,
            },
          ],
        } as never,
      }),
    ).toBe('tg:123');
  });
});
