export const CONNECTED_ACCOUNT_VISIBILITIES = ['user', 'workspace'] as const;

export type ConnectedAccountVisibility =
  (typeof CONNECTED_ACCOUNT_VISIBILITIES)[number];

export const isConnectedAccountVisibility = (
  visibility: unknown,
): visibility is ConnectedAccountVisibility =>
  (CONNECTED_ACCOUNT_VISIBILITIES as readonly unknown[]).includes(visibility);
