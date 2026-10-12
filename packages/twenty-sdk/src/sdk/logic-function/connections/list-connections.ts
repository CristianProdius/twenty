import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';
import { type ConnectedAccountVisibility } from 'twenty-shared/types';

const LIST_APP_CONNECTIONS_QUERY = `
  query ListAppConnections($filter: ListAppConnectionsInput) {
    appConnections(filter: $filter) {
      id
      providerName
      name
      handle
      visibility
      userWorkspaceId
      workspaceMemberId
      accessToken
      scopes
      authFailedAt
      authFailedReason
    }
  }
`;

export type ListConnectionsFilter = {
  providerName?: string;
  userWorkspaceId?: string;
  visibility?: ConnectedAccountVisibility;
};

export const listConnections = async (
  filter: ListConnectionsFilter = {},
): Promise<AppConnection[]> => {
  const { appConnections } = await postGraphqlRequest<
    { filter: ListConnectionsFilter },
    { appConnections: AppConnection[] }
  >({
    query: LIST_APP_CONNECTIONS_QUERY,
    variables: { filter },
    caller: 'listConnections',
  });

  return appConnections;
};
