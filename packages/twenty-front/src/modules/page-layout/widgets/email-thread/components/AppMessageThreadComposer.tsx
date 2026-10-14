import { styled } from '@linaria/react';
import {
  type KeyboardEvent,
  useCallback,
  useId,
  useState,
} from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { useSendEmail } from '@/activities/emails/hooks/useSendEmail';
import { type ReplyContextReady } from '@/activities/emails/types/ReplyContext';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { IconButton } from 'twenty-ui/components/input';
import { IconSend } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledComposer = styled.div`
  align-items: flex-end;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledTextArea = styled(TextareaAutosize)`
  background: transparent;
  border: none;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  line-height: 1.4;
  outline: none;
  padding: ${themeCssVariables.spacing[1]} 0;
  resize: none;
  width: 100%;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }
`;

type AppMessageThreadComposerProps = {
  replyContext: ReplyContextReady;
  onSent?: (messageThreadId: string | null) => void;
};

export const AppMessageThreadComposer = ({
  replyContext,
  onSent,
}: AppMessageThreadComposerProps) => {
  const textAreaId = useId();
  const [body, setBody] = useState('');
  const { sendEmail, loading } = useSendEmail();

  const canSend =
    isNonEmptyString(body.trim()) &&
    isNonEmptyString(replyContext.to) &&
    isNonEmptyString(replyContext.connectedAccountId) &&
    !loading;

  const handleSend = useCallback(async () => {
    if (!canSend) {
      return;
    }

    const { success, messageThreadId } = await sendEmail({
      connectedAccountId: replyContext.connectedAccountId,
      to: replyContext.to,
      subject: '',
      body: body.trim(),
      inReplyTo: replyContext.inReplyTo || undefined,
    });

    if (success) {
      setBody('');
      onSent?.(messageThreadId);
    }
  }, [body, canSend, onSent, replyContext, sendEmail]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key !== 'Enter' || event.shiftKey) {
        return;
      }

      event.preventDefault();
      void handleSend();
    },
    [handleSend],
  );

  return (
    <StyledComposer>
      <StyledTextArea
        id={textAreaId}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t`Write a reply`}
        minRows={1}
        maxRows={6}
        aria-label={t`Write a reply`}
      />
      <IconButton
        onClick={() => {
          void handleSend();
        }}
        disabled={!canSend}
        aria-label={t`Send`}
        variant="solid"
        color="accent"
        size="md"
      >
        <IconSend size={themeCssVariables.icon.size.md} />
      </IconButton>
    </StyledComposer>
  );
};
