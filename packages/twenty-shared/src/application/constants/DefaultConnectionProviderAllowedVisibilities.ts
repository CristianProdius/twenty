import { type ConnectedAccountVisibility } from '@/types/ConnectedAccountVisibility';

export const DEFAULT_CONNECTION_PROVIDER_ALLOWED_VISIBILITIES = [
  'workspace',
] as const satisfies readonly ConnectedAccountVisibility[];
