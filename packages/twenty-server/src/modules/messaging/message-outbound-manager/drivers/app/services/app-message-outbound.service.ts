import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { buildAppMessageHeaderMessageId } from 'src/engine/metadata-modules/message-channel/utils/build-app-message-header-message-id.util';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';
import { normalizeSendMessageRecipients } from 'src/modules/messaging/message-outbound-manager/utils/normalize-send-message-recipients.util';
import { parseAppInReplyToExternalId } from 'src/modules/messaging/message-outbound-manager/utils/parse-app-in-reply-to-external-id.util';

type AppMessageOutboundResult = {
  externalId: string;
};

const isAppMessageOutboundResult = (
  value: unknown,
): value is AppMessageOutboundResult => {
  if (!isDefined(value) || typeof value !== 'object') {
    return false;
  }

  return isNonEmptyString(
    (value as { externalId?: unknown }).externalId,
  );
};

@Injectable()
export class AppMessageOutboundService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
  ) {}

  async sendMessage(
    sendMessageInput: SendMessageInput,
    connectedAccount: ConnectedAccountEntity,
  ): Promise<SendMessageResult> {
    if (!isDefined(connectedAccount.applicationId)) {
      throw new Error(
        'APP connected account is missing an owning application',
      );
    }

    if (!isNonEmptyString(sendMessageInput.messageChannelId)) {
      throw new Error(
        'APP message send requires messageChannelId on the send input',
      );
    }

    if (!isNonEmptyString(sendMessageInput.threadExternalId)) {
      throw new Error(
        'APP message send requires threadExternalId on the send input',
      );
    }

    const application =
      await this.applicationService.findOneApplicationWithRelationsOrThrow({
        id: connectedAccount.applicationId,
        workspaceId: connectedAccount.workspaceId,
      });

    if (!isDefined(application.messageOutboundLogicFunctionId)) {
      throw new Error(
        `Application "${application.name}" has no messageOutbound logic function configured`,
      );
    }

    const messageChannel = await this.messageChannelRepository.findOneOrFail({
      where: {
        id: sendMessageInput.messageChannelId,
        workspaceId: connectedAccount.workspaceId,
        connectedAccountId: connectedAccount.id,
      },
    });

    const recipients = normalizeSendMessageRecipients(sendMessageInput.to).map(
      (handle) => ({ handle }),
    );

    if (recipients.length === 0) {
      throw new Error('APP message send requires at least one recipient');
    }

    const inReplyToExternalId = parseAppInReplyToExternalId({
      inReplyTo: sendMessageInput.inReplyTo,
      applicationId: application.id,
      messageChannelId: messageChannel.id,
    });

    const executionResult = await this.logicFunctionExecutorService.execute({
      logicFunctionId: application.messageOutboundLogicFunctionId,
      workspaceId: connectedAccount.workspaceId,
      payload: {
        messageChannelId: messageChannel.id,
        channelHandle: messageChannel.handle,
        threadExternalId: sendMessageInput.threadExternalId,
        recipients,
        text: sendMessageInput.body,
        inReplyToExternalId,
      },
    });

    if (isDefined(executionResult.error)) {
      throw new Error(executionResult.error.errorMessage);
    }

    if (!isAppMessageOutboundResult(executionResult.data)) {
      throw new Error(
        'APP messageOutbound logic function must return { externalId }',
      );
    }

    const { externalId } = executionResult.data;

    return {
      headerMessageId: buildAppMessageHeaderMessageId({
        applicationId: application.id,
        messageChannelId: messageChannel.id,
        externalId,
      }),
      messageExternalId: externalId,
      threadExternalId: sendMessageInput.threadExternalId,
      deliveredRecipients: {
        to: recipients.map((recipient) => recipient.handle),
        cc: [],
        bcc: [],
      },
    };
  }
}
