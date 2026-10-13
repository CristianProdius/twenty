import { isNonEmptyString } from '@sniptt/guards';

import { type VariableWithFallback } from './variable-with-fallback';

export const formatVariableWithFallback = ({
  name,
  fallback,
}: VariableWithFallback): string =>
  isNonEmptyString(fallback)
    ? `{{${name} | default: "${fallback.replace(/["\\]/g, '\\$&')}"}}`
    : `{{${name}}}`;
