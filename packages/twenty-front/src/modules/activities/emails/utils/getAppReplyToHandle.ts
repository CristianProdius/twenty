import { isNonEmptyString } from '@sniptt/guards';

import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { MessageParticipantRole } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getAppReplyToHandle = ({
  message,
  connectedAccountHandle,
}: {
  message: EmailThreadMessageWithSender;
  connectedAccountHandle: string | null | undefined;
}): string => {
  const senderHandle = message.sender?.handle ?? '';
  const wasSentByConnectedAccount =
    isNonEmptyString(connectedAccountHandle) &&
    senderHandle === connectedAccountHandle;

  if (wasSentByConnectedAccount) {
    const recipient = message.messageParticipants.find(
      (participant) =>
        participant.role === MessageParticipantRole.TO &&
        isNonEmptyString(participant.handle) &&
        participant.handle !== connectedAccountHandle,
    );

    return recipient?.handle ?? '';
  }

  if (isDefined(message.sender) && isNonEmptyString(message.sender.handle)) {
    return message.sender.handle;
  }

  return '';
};
