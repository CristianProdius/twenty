import { replaceCampaignVariables } from 'src/modules/emailing/utils/replace-campaign-variables.util';
import { resolveCampaignVariableValue } from 'src/modules/emailing/utils/resolve-campaign-variable-value.util';

export const renderCampaignTemplate = ({
  template,
  values,
  encodeValue,
}: {
  template: string;
  values: Record<string, string>;
  encodeValue: (value: string) => string;
}): string =>
  replaceCampaignVariables({
    template,
    replaceCampaignVariable: (campaignVariable) =>
      encodeValue(resolveCampaignVariableValue({ campaignVariable, values })),
  });
