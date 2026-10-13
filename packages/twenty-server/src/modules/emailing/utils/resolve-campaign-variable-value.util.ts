import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, type VariableWithFallback } from 'twenty-shared/utils';

export const resolveCampaignVariableValue = ({
  variables,
  campaignVariable: { name, fallback },
}: {
  variables: Record<string, string>;
  campaignVariable: VariableWithFallback;
}): string => {
  const value = Object.prototype.hasOwnProperty.call(variables, name)
    ? (variables[name] ?? '')
    : '';

  return isDefined(fallback) && !isNonEmptyString(value.trim())
    ? fallback
    : value;
};
