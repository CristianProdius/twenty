import { isNonEmptyString } from '@sniptt/guards';

import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getAppReplyToHandle } from '@/activities/emails/utils/getAppReplyToHandle';
import { isDefined } from 'twenty-shared/utils';

export const getAppMessageThreadCounterpartParticipant = ({
  messages,
  connectedAccountHandle,
}: {
  messages: EmailThreadMessageWithSender[];
  connectedAccountHandle: string | null | undefined;
}): EmailThreadMessageParticipant | null => {
  const sentMessages = messages.filter((message) => !message.isDraft);
  const lastSentMessage = sentMessages[sentMessages.length - 1];

  if (!isDefined(lastSentMessage)) {
    return null;
  }

  const counterpartHandle = getAppReplyToHandle({
    message: lastSentMessage,
    connectedAccountHandle,
  });

  if (!isNonEmptyString(counterpartHandle)) {
    return null;
  }

  const matchingParticipant = lastSentMessage.messageParticipants.find(
    (participant) => participant.handle === counterpartHandle,
  );

  if (isDefined(matchingParticipant)) {
    return matchingParticipant;
  }

  if (lastSentMessage.sender?.handle === counterpartHandle) {
    return lastSentMessage.sender;
  }

  return null;
};
