import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const CREATE_APP_STATIC_CONNECTION_MUTATION = `
  mutation CreateAppStaticConnection($input: CreateAppStaticConnectionInput!) {
    createAppStaticConnection(input: $input) {
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

export type CreateStaticConnectionInput = {
  providerName: string;
  handle: string;
  displayName?: string;
  // Static connections are always workspace-visible (school inbox shared by staff).
  visibility: 'workspace';
};

export const createStaticConnection = async (
  input: CreateStaticConnectionInput,
): Promise<AppConnection> => {
  const { createAppStaticConnection } = await postGraphqlRequest<
    {
      input: {
        providerName: string;
        handle: string;
        displayName?: string;
      };
    },
    { createAppStaticConnection: AppConnection }
  >({
    query: CREATE_APP_STATIC_CONNECTION_MUTATION,
    variables: {
      input: {
        providerName: input.providerName,
        handle: input.handle,
        displayName: input.displayName,
      },
    },
    caller: 'createStaticConnection',
  });

  return createAppStaticConnection;
};
