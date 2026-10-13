import { isDefined } from '@/utils/validation/isDefined';

import { type CampaignVariable } from './campaign-variable';
import { CAMPAIGN_VARIABLE_PATTERN } from './campaign-variable-pattern';

export const parseCampaignVariable = (
  variable: string,
): CampaignVariable | undefined => {
  const [match] = variable.matchAll(CAMPAIGN_VARIABLE_PATTERN);

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
