import {
  isDefined,
  parseTemplateVariableWithFallback,
  TEMPLATE_VARIABLE_WITH_FALLBACK_PATTERN,
  type TemplateVariableWithFallback,
} from 'twenty-shared/utils';

export const replaceCampaignVariables = ({
  template,
  replaceCampaignVariable,
}: {
  template: string;
  replaceCampaignVariable: (
    campaignVariable: TemplateVariableWithFallback,
  ) => string;
}): string =>
  template.replace(
    TEMPLATE_VARIABLE_WITH_FALLBACK_PATTERN,
    (rawTemplateVariable) => {
      const campaignVariable =
        parseTemplateVariableWithFallback(rawTemplateVariable);

      if (!isDefined(campaignVariable)) {
        return rawTemplateVariable;
      }

      return replaceCampaignVariable(campaignVariable);
    },
  );
