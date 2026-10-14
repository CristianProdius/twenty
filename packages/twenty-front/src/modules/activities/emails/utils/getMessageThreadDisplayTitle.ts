import { isNonEmptyString } from '@sniptt/guards';

export const getMessageThreadDisplayTitle = ({
  subject,
  isAppChannel,
  counterpartDisplayName,
}: {
  subject: string | null | undefined;
  isAppChannel: boolean;
  counterpartDisplayName: string;
}): string => {
  const trimmedSubject = subject?.trim() ?? '';

  if (isNonEmptyString(trimmedSubject)) {
    return trimmedSubject;
  }

  if (isAppChannel && isNonEmptyString(counterpartDisplayName)) {
    return counterpartDisplayName;
  }

  return '';
};
