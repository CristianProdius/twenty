import {
  CAMPAIGN_VARIABLE_PATTERN,
  isDefined,
  parseCampaignVariable,
} from 'twenty-shared/utils';

import { resolveCampaignVariableValue } from 'src/modules/emailing/utils/resolve-campaign-variable-value.util';

export const renderCampaignTemplate = (
  template: string,
  variables: Record<string, string>,
  { encodeValue }: { encodeValue: (value: string) => string },
): string =>
  template.replace(CAMPAIGN_VARIABLE_PATTERN, (variable) => {
    const campaignVariable = parseCampaignVariable(variable);

    if (!isDefined(campaignVariable)) {
      return variable;
    }

    return encodeValue(
      resolveCampaignVariableValue({ variables, campaignVariable }),
    );
  });
