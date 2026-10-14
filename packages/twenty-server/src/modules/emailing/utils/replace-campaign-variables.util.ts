import {
  isDefined,
  parseTemplateVariableWithFallback,
  type TemplateVariableWithFallback,
} from 'twenty-shared/utils';
import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from 'twenty-shared/workflow';

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
    CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    (rawTemplateVariable) => {
      const campaignVariable =
        parseTemplateVariableWithFallback(rawTemplateVariable);

      if (!isDefined(campaignVariable)) {
        return rawTemplateVariable;
      }

      return replaceCampaignVariable(campaignVariable);
    },
  );
