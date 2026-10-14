import {
  ConnectedAccountProvider,
  MessageChannelType,
} from 'twenty-shared/types';

import { SentMessagePersistenceService } from 'src/modules/messaging/message-outbound-manager/services/sent-message-persistence.service';

const buildService = ({
  channelType,
  linkedParticipants,
}: {
  channelType: MessageChannelType;
  linkedParticipants: Array<{ handle: string; personId: string }>;
}) => {
  const saveMessagesAndEnqueueContactCreation = jest.fn().mockResolvedValue({
    messageExternalIdsAndIdsMap: new Map([['ext-1', 'message-1']]),
    messageExternalIdToMessageThreadIdMap: new Map([['ext-1', 'thread-1']]),
  });
  const find = jest.fn().mockResolvedValue(linkedParticipants);
  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn(async (callback: () => Promise<void>) =>
      callback(),
    ),
    getRepository: jest.fn(() => ({ find })),
  };
  const messageChannelRepository = {
    findOneOrFail: jest.fn().mockResolvedValue({
      id: 'channel-1',
      type: channelType,
      connectedAccount: {
        handle: 'sms:+37369000999',
        provider: ConnectedAccountProvider.APP,
      },
    }),
  };
  const service = new SentMessagePersistenceService(
    messageChannelRepository as never,
    { saveMessagesAndEnqueueContactCreation } as never,
    workspaceOrmManager as never,
  );

  return { service, saveMessagesAndEnqueueContactCreation, find };
};

const persistInput = {
  sendResult: {
    headerMessageId: 'app:app-1:channel-1:ext-1',
    messageExternalId: 'ext-1',
    threadExternalId: 'sms:sms:+37369555111',
  },
  subject: '',
  body: 'Revenim cu orarul',
  recipients: { to: ['sms:+37369555111'], cc: [], bcc: [] },
  connectedAccount: { handle: 'sms:+37369000999' },
  messageChannelId: 'channel-1',
  parentThreadExternalId: 'sms:sms:+37369555111',
  workspaceId: 'workspace-1',
} as never;

describe('SentMessagePersistenceService', () => {
  it('links an app reply recipient to the person already known for that handle', async () => {
    const { service, saveMessagesAndEnqueueContactCreation } = buildService({
      channelType: MessageChannelType.APP,
      linkedParticipants: [
        { handle: 'sms:+37369555111', personId: 'person-1' },
      ],
    });

    await service.persistSentMessage(persistInput);

    const [[savedMessages]] = saveMessagesAndEnqueueContactCreation.mock.calls;
    const recipient = savedMessages[0].participants.find(
      (participant: { role: string }) => participant.role === 'TO',
    );
    const sender = savedMessages[0].participants.find(
      (participant: { role: string }) => participant.role === 'FROM',
    );

    expect(recipient.personId).toBe('person-1');
    expect(sender.personId).toBeUndefined();
  });

  it('leaves email replies to the regular participant matching', async () => {
    const { service, find } = buildService({
      channelType: MessageChannelType.EMAIL,
      linkedParticipants: [
        { handle: 'sms:+37369555111', personId: 'person-1' },
      ],
    });

    await service.persistSentMessage(persistInput);

    expect(find).not.toHaveBeenCalled();
  });
});
