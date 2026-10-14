import { isNonEmptyString } from '@sniptt/guards';
import {
  isDefined,
  type TemplateVariableWithFallback,
} from 'twenty-shared/utils';

export const resolveCampaignVariableValue = ({
  campaignVariable: { name, fallback },
  values,
}: {
  campaignVariable: TemplateVariableWithFallback;
  values: Record<string, string>;
}): string => {
  const value = Object.prototype.hasOwnProperty.call(values, name)
    ? (values[name] ?? '')
    : '';

  return isDefined(fallback) && !isNonEmptyString(value.trim())
    ? fallback
    : value;
};
