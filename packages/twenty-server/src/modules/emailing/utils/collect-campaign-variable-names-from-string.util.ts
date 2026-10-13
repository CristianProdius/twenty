import { msg } from '@lingui/core/macro';
import {
  CAMPAIGN_VARIABLE_PATTERN,
  isDefined,
  parseCampaignVariable,
} from 'twenty-shared/utils';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';

const CAMPAIGN_VARIABLE_SYNTAX =
  '{{jobTitle}} or {{jobTitle | default: "there"}}';

export const collectCampaignVariableNamesFromString = (
  value: unknown,
): Set<string> => {
  const names = new Set<string>();

  if (typeof value !== 'string') {
    return names;
  }

  for (const [variable] of value.matchAll(CAMPAIGN_VARIABLE_PATTERN)) {
    const campaignVariable = parseCampaignVariable(variable);

    if (!isDefined(campaignVariable)) {
      throw new EmailingDomainException(
        `Malformed campaign variable: ${variable}. Expected ${CAMPAIGN_VARIABLE_SYNTAX}`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_UNKNOWN_VARIABLES,
        {
          userFriendlyMessage: msg`This campaign has a variable written in the wrong format: ${variable}. Write it as ${CAMPAIGN_VARIABLE_SYNTAX}.`,
        },
      );
    }

    names.add(campaignVariable.name);
  }

  return names;
};
