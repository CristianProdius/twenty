import { styled } from '@linaria/react';

import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { getDisplayNameFromParticipant } from '@/activities/emails/utils/getDisplayNameFromParticipant';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import Linkify from 'linkify-react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import {
  beautifyPastDateRelativeToNow,
  formatToHumanReadableDate,
} from '~/utils/date-utils';

const StyledBubbleRow = styled.div<{ isOutgoing: boolean }>`
  display: flex;
  justify-content: ${({ isOutgoing }) =>
    isOutgoing ? 'flex-end' : 'flex-start'};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledBubble = styled.div<{ isOutgoing: boolean }>`
  background: ${({ isOutgoing }) =>
    isOutgoing
      ? themeCssVariables.background.tertiary
      : themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.lg};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  max-width: min(80%, 480px);
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledMeta = styled.div<{ isOutgoing: boolean }>`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: ${({ isOutgoing }) =>
    isOutgoing ? 'flex-end' : 'flex-start'};
`;

const StyledBody = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.4;
  overflow-wrap: break-word;
  white-space: pre-wrap;

  a {
    color: ${themeCssVariables.font.color.primary};
    text-decoration: underline;
  }
`;

type AppMessageBubbleProps = {
  message: EmailThreadMessageWithSender;
  isOutgoing: boolean;
};

export const AppMessageBubble = ({
  message,
  isOutgoing,
}: AppMessageBubbleProps) => {
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const senderName = isDefined(message.sender)
    ? getDisplayNameFromParticipant({ participant: message.sender })
    : t`Unknown sender`;
  const sentAtLabel = isDefined(message.receivedAt)
    ? beautifyPastDateRelativeToNow(message.receivedAt, localeCatalog)
    : null;
  const sentAtTitle = isDefined(message.receivedAt)
    ? formatToHumanReadableDate(message.receivedAt)
    : undefined;

  return (
    <StyledBubbleRow isOutgoing={isOutgoing}>
      <StyledBubble isOutgoing={isOutgoing}>
        <StyledMeta isOutgoing={isOutgoing}>
          <span>{senderName}</span>
          {isDefined(sentAtLabel) && (
            <span title={sentAtTitle}>{sentAtLabel}</span>
          )}
        </StyledMeta>
        <StyledBody>
          <Linkify
            options={{
              target: '_blank',
              rel: 'noopener noreferrer',
            }}
          >
            {message.text}
          </Linkify>
        </StyledBody>
      </StyledBubble>
    </StyledBubbleRow>
  );
};
