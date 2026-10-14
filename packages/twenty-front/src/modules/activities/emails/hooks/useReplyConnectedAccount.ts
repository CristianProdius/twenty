import { useQuery } from '@apollo/client/react';
import {
  type ConnectedAccountProvider,
  type MessageChannelType,
} from 'twenty-shared/types';

import {
  MyConnectedAccountsDocument,
  MyMessageChannelsDocument,
} from '~/generated-metadata/graphql';

export const useReplyConnectedAccount = (messageChannelId: string | null) => {
  const { data: connectedAccountsData, loading: connectedAccountsLoading } =
    useQuery(MyConnectedAccountsDocument);

  const { data: messageChannelsData, loading: messageChannelsLoading } =
    useQuery(MyMessageChannelsDocument);

  const threadMessageChannel =
    messageChannelsData?.myMessageChannels.find(
      (messageChannel) => messageChannel.id === messageChannelId,
    ) ?? null;

  const replyConnectedAccount =
    connectedAccountsData?.myConnectedAccounts.find(
      (connectedAccount) =>
        connectedAccount.id === threadMessageChannel?.connectedAccountId,
    ) ?? null;

  return {
    connectedAccountId: replyConnectedAccount?.id ?? null,
    connectedAccountHandle: replyConnectedAccount?.handle ?? null,
    connectedAccountProvider:
      (replyConnectedAccount?.provider as ConnectedAccountProvider) ?? null,
    messageChannelType: (threadMessageChannel?.type as MessageChannelType) ?? null,
    messageChannelDisplayName:
      threadMessageChannel?.displayName ??
      threadMessageChannel?.handle ??
      null,
    messageChannelId: threadMessageChannel?.id ?? null,
    loading: connectedAccountsLoading || messageChannelsLoading,
  };
};
