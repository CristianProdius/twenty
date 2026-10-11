import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { SettingsApplicationConnectionDetail } from '~/pages/settings/applications/SettingsApplicationConnectionDetail';
import {
  APPLICATION_ID,
  CONNECTED_ACCOUNT_ID,
  buildApplicationConnectionHandlers,
} from '~/pages/settings/applications/__stories__/mockedApplicationConnections';
import {
  PageDecorator,
  type PageDecoratorArgs,
} from '~/testing/decorators/PageDecorator';
import { mockedApolloClient } from '~/testing/mockedApolloClient';

const meta: Meta<PageDecoratorArgs> = {
  title: 'Pages/Settings/Applications/SettingsApplicationConnectionDetail',
  component: SettingsApplicationConnectionDetail,
  decorators: [PageDecorator],
  args: {
    routePath:
      '/settings/applications/:applicationId/connections/:connectedAccountId',
    routeParams: {
      ':applicationId': APPLICATION_ID,
      ':connectedAccountId': CONNECTED_ACCOUNT_ID,
    },
  },
  beforeEach: async () => {
    await mockedApolloClient.clearStore();
  },
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof SettingsApplicationConnectionDetail>;

export const PersonalOnlyConnectionCannotBeShared: Story = {
  parameters: {
    msw: {
      handlers: buildApplicationConnectionHandlers({
        allowedVisibilities: ['user'],
        visibility: 'user',
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Disconnect' }),
    );
    expect(
      canvas.queryByRole('button', { name: 'Share with workspace' }),
    ).not.toBeInTheDocument();
    expect(
      await within(canvasElement.ownerDocument.body).findByText(
        'Disconnect connection?',
      ),
    ).toBeVisible();
  },
};
