import { type OAuthConnectionProviderConfig } from '@/application/oauthConnectionProviderConfigType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

type ConnectionProviderManifestBase = SyncableEntityOptions & {
  name: string;
  displayName: string;
  logo?: string;
  onConnectLogicFunction?: SyncableEntityOptions;
  onDisconnectLogicFunction?: SyncableEntityOptions;
};

export type OAuthConnectionProviderManifest = ConnectionProviderManifestBase & {
  type: 'oauth';
  oauth: OAuthConnectionProviderConfig;
};

// No credential exchange — the app creates ConnectedAccount rows itself via
// createStaticConnection (Telegram bots, SMS gateways, school phone numbers).
export type StaticConnectionProviderManifest =
  ConnectionProviderManifestBase & {
    type: 'static';
  };

export type ConnectionProviderManifest =
  | OAuthConnectionProviderManifest
  | StaticConnectionProviderManifest;
