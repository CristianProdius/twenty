import { isNonEmptyString } from '@sniptt/guards';

import { type CampaignVariable } from './campaign-variable';

export const formatCampaignVariable = ({
  name,
  fallback,
}: CampaignVariable): string =>
  isNonEmptyString(fallback)
    ? `{{${name} | default: "${fallback.replace(/["\\]/g, '\\$&')}"}}`
    : `{{${name}}}`;
