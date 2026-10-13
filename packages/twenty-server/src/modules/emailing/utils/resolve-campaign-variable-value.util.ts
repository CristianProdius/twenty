import { type CampaignVariable, isDefined } from 'twenty-shared/utils';

export const resolveCampaignVariableValue = ({
  variables,
  campaignVariable: { name, fallback },
}: {
  variables: Record<string, string>;
  campaignVariable: CampaignVariable;
}): string => {
  const value = Object.prototype.hasOwnProperty.call(variables, name)
    ? (variables[name] ?? '')
    : '';

  return isDefined(fallback) && value.trim() === '' ? fallback : value;
};
