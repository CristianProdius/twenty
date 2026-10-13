import {
  isDefined,
  parseVariableWithFallback,
  VARIABLE_WITH_FALLBACK_PATTERN,
  type VariableWithFallback,
} from 'twenty-shared/utils';

export const replaceCampaignVariables = ({
  template,
  replaceCampaignVariable,
}: {
  template: string;
  replaceCampaignVariable: (campaignVariable: VariableWithFallback) => string;
}): string =>
  template.replace(VARIABLE_WITH_FALLBACK_PATTERN, (variable) => {
    const campaignVariable = parseVariableWithFallback(variable);

    if (!isDefined(campaignVariable)) {
      return variable;
    }

    return replaceCampaignVariable(campaignVariable);
  });
