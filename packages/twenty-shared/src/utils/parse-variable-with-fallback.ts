import { isDefined } from '@/utils/validation/isDefined';

import { type VariableWithFallback } from './variable-with-fallback';
import { VARIABLE_WITH_FALLBACK_PATTERN } from './variable-with-fallback-pattern';

export const parseVariableWithFallback = (
  variable: string,
): VariableWithFallback | undefined => {
  const [match] = variable.matchAll(VARIABLE_WITH_FALLBACK_PATTERN);

  if (!isDefined(match) || match[0] !== variable) {
    return undefined;
  }

  const [, name, escapedFallback] = match;

  if (!isDefined(name)) {
    return undefined;
  }

  if (!isDefined(escapedFallback)) {
    return { name };
  }

  return { name, fallback: escapedFallback.replace(/\\(["\\])/g, '$1') };
};
