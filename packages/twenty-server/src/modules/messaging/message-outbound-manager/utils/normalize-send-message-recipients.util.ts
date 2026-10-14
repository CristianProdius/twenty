import { isNonEmptyString } from '@sniptt/guards';

export const normalizeSendMessageRecipients = (
  recipients: string | string[] | undefined,
): string[] => {
  if (!recipients) {
    return [];
  }

  const values = Array.isArray(recipients) ? recipients : [recipients];

  return values
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(isNonEmptyString);
};
