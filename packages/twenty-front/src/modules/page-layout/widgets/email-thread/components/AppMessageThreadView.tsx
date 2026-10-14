import { styled } from '@linaria/react';

import { CustomResolverFetchMoreLoader } from '@/activities/components/CustomResolverFetchMoreLoader';
import { type EmailThreadMessageWithSender } from '@/activities/emails/types/EmailThreadMessageWithSender';
import { AppMessageBubble } from '@/page-layout/widgets/email-thread/components/AppMessageBubble';
import { isNonEmptyString } from '@sniptt/guards';
import { IconMessage } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledChannelHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledMessages = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

type AppMessageThreadViewProps = {
  messages: EmailThreadMessageWithSender[];
  channelName: string;
  connectedAccountHandle: string | null;
  threadLoading: boolean;
  fetchMoreMessages: () => void;
};

export const AppMessageThreadView = ({
  messages,
  channelName,
  connectedAccountHandle,
  threadLoading,
  fetchMoreMessages,
}: AppMessageThreadViewProps) => {
  return (
    <>
      {isNonEmptyString(channelName) && (
        <StyledChannelHeader>
          <IconMessage size={themeCssVariables.icon.size.md} />
          <span>{channelName}</span>
        </StyledChannelHeader>
      )}
      <StyledMessages>
        {messages
          .filter((message) => !message.isDraft)
          .map((message) => {
            const isOutgoing =
              isNonEmptyString(connectedAccountHandle) &&
              message.sender?.handle === connectedAccountHandle;

            return (
              <AppMessageBubble
                key={message.id}
                message={message}
                isOutgoing={isOutgoing}
              />
            );
          })}
        <CustomResolverFetchMoreLoader
          loading={threadLoading}
          onLastRowVisible={fetchMoreMessages}
        />
      </StyledMessages>
    </>
  );
};
