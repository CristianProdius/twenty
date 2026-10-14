import { getAppMessageThreadCounterpartParticipant } from '@/activities/emails/utils/getAppMessageThreadCounterpartParticipant';
import { MessageParticipantRole } from 'twenty-shared/types';

describe('getAppMessageThreadCounterpartParticipant', () => {
  it('returns the sender participant for an incoming APP message', () => {
    const sender = {
      id: 'sender-1',
      handle: 'tg:123',
      displayName: 'Maria',
      role: MessageParticipantRole.FROM,
      messageId: 'msg-1',
      person: {
        name: { firstName: 'Maria', lastName: 'Ceban' },
      },
    };

    const participant = getAppMessageThreadCounterpartParticipant({
      connectedAccountHandle: 'tg-bot:school',
      messages: [
        {
          id: 'msg-1',
          isDraft: false,
          sender,
          messageParticipants: [
            sender,
            {
              id: 'to-1',
              handle: 'tg-bot:school',
              displayName: 'School bot',
              role: MessageParticipantRole.TO,
              messageId: 'msg-1',
            },
          ],
        } as never,
      ],
    });

    expect(participant?.handle).toBe('tg:123');
    expect(participant?.person?.name?.firstName).toBe('Maria');
  });

  it('returns the TO participant when the last message was outgoing', () => {
    const recipient = {
      id: 'to-1',
      handle: 'tg:123',
      displayName: 'Maria',
      role: MessageParticipantRole.TO,
      messageId: 'msg-1',
      person: {
        name: { firstName: 'Maria', lastName: 'Ceban' },
      },
    };

    const participant = getAppMessageThreadCounterpartParticipant({
      connectedAccountHandle: 'tg-bot:school',
      messages: [
        {
          id: 'msg-1',
          isDraft: false,
          sender: {
            id: 'from-1',
            handle: 'tg-bot:school',
            displayName: 'School bot',
            role: MessageParticipantRole.FROM,
            messageId: 'msg-1',
          },
          messageParticipants: [
            {
              id: 'from-1',
              handle: 'tg-bot:school',
              displayName: 'School bot',
              role: MessageParticipantRole.FROM,
              messageId: 'msg-1',
            },
            recipient,
          ],
        } as never,
      ],
    });

    expect(participant?.handle).toBe('tg:123');
  });

  it('returns null when there are no sent messages', () => {
    expect(
      getAppMessageThreadCounterpartParticipant({
        connectedAccountHandle: 'tg-bot:school',
        messages: [],
      }),
    ).toBeNull();
  });
});
