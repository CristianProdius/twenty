import {
  type ConnectionProviderManifest,
  DEFAULT_CONNECTION_PROVIDER_ALLOWED_VISIBILITIES,
  type StoredOAuthConnectionProviderConfig,
} from 'twenty-shared/application';

import { type UniversalFlatConnectionProvider } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-connection-provider.type';

// Invalid declarations pass through untouched so the sync validator can reject them.
const resolveAllowedVisibilities = (
  allowedVisibilities: ConnectionProviderManifest['allowedVisibilities'],
): UniversalFlatConnectionProvider['allowedVisibilities'] => {
  if (allowedVisibilities === undefined) {
    return [...DEFAULT_CONNECTION_PROVIDER_ALLOWED_VISIBILITIES];
  }

  if (!Array.isArray(allowedVisibilities)) {
    return allowedVisibilities;
  }

  // A stable order keeps a reordered declaration from emitting an update on every sync.
  return [...allowedVisibilities].sort();
};

export const fromConnectionProviderManifestToUniversalFlatConnectionProvider =
  ({
    connectionProviderManifest,
    applicationUniversalIdentifier,
    now,
  }: {
    connectionProviderManifest: ConnectionProviderManifest;
    applicationUniversalIdentifier: string;
    now: string;
  }): UniversalFlatConnectionProvider => {
    const oauthConfig: StoredOAuthConnectionProviderConfig | null =
      connectionProviderManifest.type === 'oauth'
        ? {
            authorizationEndpoint:
              connectionProviderManifest.oauth.authorizationEndpoint,
            tokenEndpoint: connectionProviderManifest.oauth.tokenEndpoint,
            revokeEndpoint:
              connectionProviderManifest.oauth.revokeEndpoint ?? null,
            scopes: connectionProviderManifest.oauth.scopes,
            clientIdVariable: connectionProviderManifest.oauth.clientIdVariable,
            clientSecretVariable:
              connectionProviderManifest.oauth.clientSecretVariable,
            authorizationParams:
              connectionProviderManifest.oauth.authorizationParams ?? null,
            tokenRequestContentType:
              connectionProviderManifest.oauth.tokenRequestContentType ??
              'json',
            usePkce: connectionProviderManifest.oauth.usePkce ?? true,
          }
        : null;

    return {
      universalIdentifier: connectionProviderManifest.universalIdentifier,
      applicationUniversalIdentifier,
      name: connectionProviderManifest.name,
      displayName: connectionProviderManifest.displayName,
      allowedVisibilities: resolveAllowedVisibilities(
        connectionProviderManifest.allowedVisibilities,
      ),
      logo: connectionProviderManifest.logo ?? null,
      type: connectionProviderManifest.type,
      oauthConfig,
      onConnectLogicFunctionUniversalIdentifier:
        connectionProviderManifest.onConnectLogicFunction
          ?.universalIdentifier ?? null,
      onDisconnectLogicFunctionUniversalIdentifier:
        connectionProviderManifest.onDisconnectLogicFunction
          ?.universalIdentifier ?? null,
      createdAt: now,
      updatedAt: now,
    };
  };
