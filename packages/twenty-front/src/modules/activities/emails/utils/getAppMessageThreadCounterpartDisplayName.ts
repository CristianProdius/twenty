import { isNonEmptyString } from '@sniptt/guards';

import { type EmailThreadMessageParticipant } from '@/activities/emails/types/EmailThreadMessageParticipant';
import { isDefined } from 'twenty-shared/utils';

export const getAppMessageThreadCounterpartDisplayName = ({
  participant,
}: {
  participant:
    | (Pick<EmailThreadMessageParticipant, 'displayName' | 'handle'> & {
        person?: EmailThreadMessageParticipant['person'] | null;
      })
    | null
    | undefined;
}): string => {
  if (!isDefined(participant)) {
    return '';
  }

  const personName = isDefined(participant.person)
    ? [participant.person.name?.firstName, participant.person.name?.lastName]
        .filter(isNonEmptyString)
        .join(' ')
    : '';

  return (
    [personName, participant.displayName, participant.handle].find(
      isNonEmptyString,
    ) ?? ''
  );
};
