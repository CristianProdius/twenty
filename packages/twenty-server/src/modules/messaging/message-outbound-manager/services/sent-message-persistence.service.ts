import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  MessageChannelType,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not, Repository } from 'typeorm';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message.type';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import { type PersistSentMessageInput } from 'src/modules/messaging/message-outbound-manager/types/persist-sent-message-input.type';
import { type PersistedSentMessage } from 'src/modules/messaging/message-outbound-manager/types/persisted-sent-message.type';
import { formatSentMessage } from 'src/modules/messaging/message-outbound-manager/utils/format-sent-message.util';

@Injectable()
export class SentMessagePersistenceService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly saveMessagesAndEnqueueContactCreationService: MessagingSaveMessagesAndEnqueueContactCreationService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async persistSentMessage(
    input: PersistSentMessageInput,
  ): Promise<PersistedSentMessage | undefined> {
    const messageChannel = await this.messageChannelRepository.findOneOrFail({
      where: {
        id: input.messageChannelId,
        workspaceId: input.workspaceId,
      },
      relations: { connectedAccount: true },
    });

    const formattedMessage = formatSentMessage(input);

    // App channels skip email-based participant matching, so a reply would land on nobody's
    // record; reuse the Person already linked to each recipient handle on earlier messages.
    const messageToSave =
      messageChannel.type === MessageChannelType.APP
        ? await this.linkKnownRecipients(formattedMessage, input.workspaceId)
        : formattedMessage;

    const savedMessagesResult =
      await this.saveMessagesAndEnqueueContactCreationService.saveMessagesAndEnqueueContactCreation(
        [messageToSave],
        messageChannel,
        messageChannel.connectedAccount,
        input.workspaceId,
      );

    const messageId = savedMessagesResult?.messageExternalIdsAndIdsMap.get(
      messageToSave.externalId,
    );
    const messageThreadId =
      savedMessagesResult?.messageExternalIdToMessageThreadIdMap.get(
        messageToSave.externalId,
      );

    if (!isDefined(messageId) || !isDefined(messageThreadId)) {
      return undefined;
    }

    return { messageId, messageThreadId };
  }

  private async linkKnownRecipients(
    message: MessageWithParticipants,
    workspaceId: string,
  ): Promise<MessageWithParticipants> {
    const recipientHandles = message.participants
      .filter((participant) => participant.role !== MessageParticipantRole.FROM)
      .map((participant) => participant.handle)
      .filter(isDefined);

    if (recipientHandles.length === 0) {
      return message;
    }

    const personIdByHandle = new Map<string, string>();

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const messageParticipantRepository =
        this.workspaceOrmManager.getRepository<MessageParticipantWorkspaceEntity>(
          'messageParticipant',
          { shouldBypassPermissionChecks: true },
        );

      const linkedParticipants = await messageParticipantRepository.find({
        where: { handle: In(recipientHandles), personId: Not(IsNull()) },
        order: { createdAt: 'DESC' },
      });

      for (const linkedParticipant of linkedParticipants) {
        const { handle, personId } = linkedParticipant;

        if (
          isDefined(handle) &&
          isDefined(personId) &&
          !personIdByHandle.has(handle)
        ) {
          personIdByHandle.set(handle, personId);
        }
      }
    }, buildSystemAuthContext(workspaceId));

    return {
      ...message,
      participants: message.participants.map((participant) => {
        const personId = isDefined(participant.handle)
          ? personIdByHandle.get(participant.handle)
          : undefined;

        return participant.role !== MessageParticipantRole.FROM &&
          isDefined(personId)
          ? { ...participant, personId }
          : participant;
      }),
    };
  }
}
