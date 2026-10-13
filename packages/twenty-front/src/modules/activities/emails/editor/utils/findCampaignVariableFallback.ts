import { isNonEmptyString, isString } from '@sniptt/guards';
import type { JSONContent } from '@tiptap/react';
import {
  CAMPAIGN_VARIABLE_PATTERN,
  TIPTAP_NODE_TYPES,
  isDefined,
  parseCampaignVariable,
} from 'twenty-shared/utils';

type FindCampaignVariableFallbackArgs = {
  subject: string;
  bodyDocument: JSONContent | undefined;
  name: string;
};

const listBodyDocumentVariables = (node: JSONContent): string[] => [
  ...(node.type === TIPTAP_NODE_TYPES.VARIABLE_TAG &&
  isString(node.attrs?.variable)
    ? [node.attrs.variable]
    : []),
  ...(node.content ?? []).flatMap(listBodyDocumentVariables),
];

export const findCampaignVariableFallback = ({
  subject,
  bodyDocument,
  name,
}: FindCampaignVariableFallbackArgs): string | undefined => {
  const subjectVariables = Array.from(
    subject.matchAll(CAMPAIGN_VARIABLE_PATTERN),
    ([variable]) => variable,
  );
  const bodyVariables = isDefined(bodyDocument)
    ? listBodyDocumentVariables(bodyDocument)
    : [];

  return [...subjectVariables, ...bodyVariables]
    .map((variable) => parseCampaignVariable(variable))
    .find(
      (campaignVariable) =>
        campaignVariable?.name === name &&
        isNonEmptyString(campaignVariable.fallback),
    )?.fallback;
};
