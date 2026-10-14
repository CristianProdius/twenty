import { ConnectedAccountProvider } from 'twenty-shared/types';

jest.mock(
  'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service',
  () => ({
    LogicFunctionExecutorService: class LogicFunctionExecutorService {},
  }),
);
jest.mock('src/engine/core-modules/application/application.service', () => ({
  ApplicationService: class ApplicationService {},
}));

import { AppMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/drivers/app/services/app-message-outbound.service';

describe('AppMessageOutboundService', () => {
  const applicationService = {
    findOneApplicationWithRelationsOrThrow: jest.fn(),
  };
  const logicFunctionExecutorService = {
    execute: jest.fn(),
  };
  const messageChannelRepository = {
    findOneOrFail: jest.fn(),
  };

  const service = new AppMessageOutboundService(
    applicationService as never,
    logicFunctionExecutorService as never,
    messageChannelRepository as never,
  );

  const connectedAccount = {
    id: 'connected-account-1',
    applicationId: 'application-1',
    workspaceId: 'workspace-1',
    provider: ConnectedAccountProvider.APP,
    handle: 'tg-bot:easybac_help_bot',
  };

  const sendMessageInput = {
    body: 'Bună ziua!',
    subject: '',
    html: '',
    to: 'tg:123456',
    threadExternalId: 'telegram_bot:tg:123456',
    messageChannelId: 'channel-1',
    inReplyTo: 'app:application-1:channel-1:telegram_bot:123456:42',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('invokes the app outbound logic function and returns a dedupe-safe send result', async () => {
    applicationService.findOneApplicationWithRelationsOrThrow.mockResolvedValue(
      {
        id: 'application-1',
        name: 'EasyBac Channels',
        messageOutboundLogicFunctionId: 'logic-function-1',
      },
    );
    messageChannelRepository.findOneOrFail.mockResolvedValue({
      id: 'channel-1',
      handle: 'tg-bot:easybac_help_bot',
    });
    logicFunctionExecutorService.execute.mockResolvedValue({
      data: { externalId: 'telegram_bot:123456:43' },
      duration: 10,
      billedDurationMs: 10,
      logs: '',
      status: 'SUCCESS',
    });

    const result = await service.sendMessage(
      sendMessageInput,
      connectedAccount as never,
    );

    expect(logicFunctionExecutorService.execute).toHaveBeenCalledWith({
      logicFunctionId: 'logic-function-1',
      workspaceId: 'workspace-1',
      payload: {
        messageChannelId: 'channel-1',
        channelHandle: 'tg-bot:easybac_help_bot',
        threadExternalId: 'telegram_bot:tg:123456',
        recipients: [{ handle: 'tg:123456' }],
        text: 'Bună ziua!',
        inReplyToExternalId: 'telegram_bot:123456:42',
      },
    });
    expect(result).toEqual({
      headerMessageId: 'app:application-1:channel-1:telegram_bot:123456:43',
      messageExternalId: 'telegram_bot:123456:43',
      threadExternalId: 'telegram_bot:tg:123456',
      deliveredRecipients: {
        to: ['tg:123456'],
        cc: [],
        bcc: [],
      },
    });
  });

  it('surfaces logic function errors as send failures', async () => {
    applicationService.findOneApplicationWithRelationsOrThrow.mockResolvedValue(
      {
        id: 'application-1',
        name: 'EasyBac Channels',
        messageOutboundLogicFunctionId: 'logic-function-1',
      },
    );
    messageChannelRepository.findOneOrFail.mockResolvedValue({
      id: 'channel-1',
      handle: 'tg-bot:easybac_help_bot',
    });
    logicFunctionExecutorService.execute.mockResolvedValue({
      data: null,
      duration: 10,
      billedDurationMs: 10,
      logs: '',
      status: 'ERROR',
      error: {
        errorType: 'UnhandledError',
        errorMessage: 'window_closed',
        stackTrace: [],
      },
    });

    await expect(
      service.sendMessage(sendMessageInput, connectedAccount as never),
    ).rejects.toThrow('window_closed');
  });

  it('throws when the application has no outbound handler', async () => {
    applicationService.findOneApplicationWithRelationsOrThrow.mockResolvedValue(
      {
        id: 'application-1',
        name: 'EasyBac Channels',
        messageOutboundLogicFunctionId: null,
      },
    );

    await expect(
      service.sendMessage(sendMessageInput, connectedAccount as never),
    ).rejects.toThrow(
      'Application "EasyBac Channels" has no messageOutbound logic function configured',
    );
  });

  it('throws when the logic function omits externalId', async () => {
    applicationService.findOneApplicationWithRelationsOrThrow.mockResolvedValue(
      {
        id: 'application-1',
        name: 'EasyBac Channels',
        messageOutboundLogicFunctionId: 'logic-function-1',
      },
    );
    messageChannelRepository.findOneOrFail.mockResolvedValue({
      id: 'channel-1',
      handle: 'tg-bot:easybac_help_bot',
    });
    logicFunctionExecutorService.execute.mockResolvedValue({
      data: { ok: true },
      duration: 10,
      billedDurationMs: 10,
      logs: '',
      status: 'SUCCESS',
    });

    await expect(
      service.sendMessage(sendMessageInput, connectedAccount as never),
    ).rejects.toThrow(
      'APP messageOutbound logic function must return { externalId }',
    );
  });
});
