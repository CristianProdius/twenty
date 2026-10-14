import { isNonEmptyString } from '@sniptt/guards';

export const parseAppInReplyToExternalId = ({
  inReplyTo,
  applicationId,
  messageChannelId,
}: {
  inReplyTo?: string;
  applicationId: string;
  messageChannelId: string;
}): string | undefined => {
  if (!isNonEmptyString(inReplyTo)) {
    return undefined;
  }

  const prefix = `app:${applicationId}:${messageChannelId}:`;

  if (inReplyTo.startsWith(prefix)) {
    const externalId = inReplyTo.slice(prefix.length);

    return isNonEmptyString(externalId) ? externalId : undefined;
  }

  return inReplyTo;
};
