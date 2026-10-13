import { msg } from '@lingui/core/macro';
import {
  isDefined,
  parseTemplateVariableWithFallback,
  TEMPLATE_VARIABLE_WITH_FALLBACK_PATTERN,
} from 'twenty-shared/utils';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';

export const collectCampaignVariableNamesFromString = (
  value: unknown,
): Set<string> => {
  const names = new Set<string>();

  if (typeof value !== 'string') {
    return names;
  }

  for (const [rawTemplateVariable] of value.matchAll(
    TEMPLATE_VARIABLE_WITH_FALLBACK_PATTERN,
  )) {
    const campaignVariable =
      parseTemplateVariableWithFallback(rawTemplateVariable);

    if (!isDefined(campaignVariable)) {
      const expectedSyntax = '{{jobTitle}} or {{jobTitle | default: "there"}}';

      throw new EmailingDomainException(
        `Malformed campaign variable: ${rawTemplateVariable}. Expected ${expectedSyntax}`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
        {
          userFriendlyMessage: msg`This campaign has a variable written in the wrong format: ${rawTemplateVariable}. Write it as ${expectedSyntax}.`,
        },
      );
    }

    names.add(campaignVariable.name);
  }

  return names;
};
