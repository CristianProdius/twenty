import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AppMessageThreadComposer } from '@/page-layout/widgets/email-thread/components/AppMessageThreadComposer';
import { ConnectedAccountProvider } from 'twenty-shared/types';

const sendEmailMock = jest.fn();

jest.mock('@/activities/emails/hooks/useSendEmail', () => ({
  useSendEmail: () => ({
    sendEmail: sendEmailMock,
    loading: false,
  }),
}));

describe('AppMessageThreadComposer', () => {
  beforeEach(() => {
    sendEmailMock.mockReset();
    sendEmailMock.mockResolvedValue({ success: true, messageThreadId: null });
  });

  it('sends on Enter and keeps Shift+Enter as a newline', async () => {
    const user = userEvent.setup();

    render(
      <AppMessageThreadComposer
        replyContext={{
          loading: false,
          to: 'tg:123',
          subject: '',
          inReplyTo: 'app:app-1:channel-1:ext-1',
          connectedAccountId: 'account-1',
          connectedAccountProvider: ConnectedAccountProvider.APP,
        }}
      />,
    );

    const textarea = screen.getByLabelText('Write a reply');

    await user.type(textarea, 'Hello');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    await user.type(textarea, ' still here');

    expect(sendEmailMock).not.toHaveBeenCalled();

    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    await waitFor(() => {
      expect(sendEmailMock).toHaveBeenCalledWith({
        connectedAccountId: 'account-1',
        to: 'tg:123',
        subject: '',
        body: expect.stringContaining('Hello'),
        inReplyTo: 'app:app-1:channel-1:ext-1',
      });
    });
  });
});
