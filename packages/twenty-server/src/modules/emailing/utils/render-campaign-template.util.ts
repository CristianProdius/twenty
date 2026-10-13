import {
  isDefined,
  parseVariableWithFallback,
  VARIABLE_WITH_FALLBACK_PATTERN,
} from 'twenty-shared/utils';

import { resolveCampaignVariableValue } from 'src/modules/emailing/utils/resolve-campaign-variable-value.util';

export const renderCampaignTemplate = (
  template: string,
  variables: Record<string, string>,
  { encodeValue }: { encodeValue: (value: string) => string },
): string =>
  template.replace(VARIABLE_WITH_FALLBACK_PATTERN, (variable) => {
    const campaignVariable = parseVariableWithFallback(variable);

    if (!isDefined(campaignVariable)) {
      return variable;
    }

    return encodeValue(
      resolveCampaignVariableValue({ variables, campaignVariable }),
    );
  });
