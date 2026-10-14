import { ConnectedAccountProvider } from 'twenty-shared/types';

jest.mock(
  'src/modules/messaging/message-outbound-manager/drivers/app/services/app-message-outbound.service',
  () => ({
    AppMessageOutboundService: class AppMessageOutboundService {},
  }),
);
jest.mock(
  'src/modules/messaging/message-outbound-manager/drivers/gmail/services/gmail-message-outbound.service',
  () => ({
    GmailMessageOutboundService: class GmailMessageOutboundService {},
  }),
);
jest.mock(
  'src/modules/messaging/message-outbound-manager/drivers/microsoft/services/microsoft-message-outbound.service',
  () => ({
    MicrosoftMessageOutboundService: class MicrosoftMessageOutboundService {},
  }),
);
jest.mock(
  'src/modules/messaging/message-outbound-manager/drivers/imap/services/imap-smtp-message-outbound.service',
  () => ({
    ImapSmtpMessageOutboundService: class ImapSmtpMessageOutboundService {},
  }),
);
jest.mock(
  'src/modules/messaging/message-outbound-manager/drivers/email-group/services/email-group-message-outbound.service',
  () => ({
    EmailGroupMessageOutboundService: class EmailGroupMessageOutboundService {},
  }),
);

import { MessagingMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/services/messaging-message-outbound.service';

describe('MessagingMessageOutboundService', () => {
  const gmailMessageOutboundService = { sendMessage: jest.fn() };
  const microsoftMessageOutboundService = { sendMessage: jest.fn() };
  const imapSmtpMessageOutboundService = { sendMessage: jest.fn() };
  const emailGroupMessageOutboundService = { sendMessage: jest.fn() };
  const appMessageOutboundService = { sendMessage: jest.fn() };

  const service = new MessagingMessageOutboundService(
    gmailMessageOutboundService as never,
    microsoftMessageOutboundService as never,
    imapSmtpMessageOutboundService as never,
    emailGroupMessageOutboundService as never,
    appMessageOutboundService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('routes APP connected accounts to the app outbound service', async () => {
    const sendMessageInput = {
      body: 'hello',
      subject: '',
      html: '',
      to: 'tg:1',
      messageChannelId: 'channel-1',
      threadExternalId: 'telegram_bot:tg:1',
    };
    const connectedAccount = {
      provider: ConnectedAccountProvider.APP,
    };

    appMessageOutboundService.sendMessage.mockResolvedValue({
      headerMessageId: 'app:app-1:channel-1:ext-1',
      messageExternalId: 'ext-1',
    });

    await expect(
      service.sendMessage(sendMessageInput, connectedAccount as never),
    ).resolves.toEqual({
      headerMessageId: 'app:app-1:channel-1:ext-1',
      messageExternalId: 'ext-1',
    });
    expect(appMessageOutboundService.sendMessage).toHaveBeenCalledWith(
      sendMessageInput,
      connectedAccount,
    );
  });

  it('still rejects APP draft creation', async () => {
    await expect(
      service.createDraft(
        {
          body: 'hello',
          subject: '',
          html: '',
          to: 'tg:1',
        },
        { provider: ConnectedAccountProvider.APP } as never,
      ),
    ).rejects.toThrow(
      `Provider ${ConnectedAccountProvider.APP} does not support creating drafts`,
    );
  });
});
