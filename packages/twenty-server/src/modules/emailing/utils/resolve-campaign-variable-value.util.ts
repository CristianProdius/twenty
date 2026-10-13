import { isNonEmptyString } from '@sniptt/guards';
import {
  isDefined,
  type TemplateVariableWithFallback,
} from 'twenty-shared/utils';

export const resolveCampaignVariableValue = ({
  valuesByVariableName,
  campaignVariable: { name, fallback },
}: {
  valuesByVariableName: Record<string, string>;
  campaignVariable: TemplateVariableWithFallback;
}): string => {
  const value = Object.prototype.hasOwnProperty.call(valuesByVariableName, name)
    ? (valuesByVariableName[name] ?? '')
    : '';

  return isDefined(fallback) && !isNonEmptyString(value.trim())
    ? fallback
    : value;
};
