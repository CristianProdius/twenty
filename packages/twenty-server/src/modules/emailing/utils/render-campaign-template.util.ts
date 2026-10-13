import { replaceCampaignVariables } from 'src/modules/emailing/utils/replace-campaign-variables.util';
import { resolveCampaignVariableValue } from 'src/modules/emailing/utils/resolve-campaign-variable-value.util';

export const renderCampaignTemplate = (
  template: string,
  variables: Record<string, string>,
  { encodeValue }: { encodeValue: (value: string) => string },
): string =>
  replaceCampaignVariables(template, (campaignVariable) =>
    encodeValue(resolveCampaignVariableValue({ variables, campaignVariable })),
  );
