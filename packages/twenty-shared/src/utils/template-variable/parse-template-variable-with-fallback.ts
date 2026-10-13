import { isDefined } from '@/utils/validation/isDefined';

import { type TemplateVariableWithFallback } from './template-variable-with-fallback';
import { TEMPLATE_VARIABLE_WITH_FALLBACK_PATTERN } from './template-variable-with-fallback-pattern';

export const parseTemplateVariableWithFallback = (
  rawTemplateVariable: string,
): TemplateVariableWithFallback | undefined => {
  const [match] = rawTemplateVariable.matchAll(
    TEMPLATE_VARIABLE_WITH_FALLBACK_PATTERN,
  );

  if (!isDefined(match) || match[0] !== rawTemplateVariable) {
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
