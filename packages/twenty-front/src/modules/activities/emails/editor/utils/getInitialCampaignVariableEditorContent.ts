import { isNonEmptyString } from '@sniptt/guards';
import type { JSONContent } from '@tiptap/react';
import {
  CAMPAIGN_VARIABLE_PATTERN,
  TIPTAP_NODE_TYPES,
  isDefined,
} from 'twenty-shared/utils';

export const getInitialCampaignVariableEditorContent = (
  rawContent: string,
): JSONContent => {
  const paragraphContent: JSONContent[] = [];
  let textStartIndex = 0;

  for (const match of rawContent.matchAll(CAMPAIGN_VARIABLE_PATTERN)) {
    const [variable, variableName] = match;

    if (!isDefined(variableName)) {
      continue;
    }

    const text = rawContent.slice(textStartIndex, match.index);

    if (isNonEmptyString(text)) {
      paragraphContent.push({ type: 'text', text });
    }

    paragraphContent.push({
      type: TIPTAP_NODE_TYPES.VARIABLE_TAG,
      attrs: { variable },
    });
    textStartIndex = match.index + variable.length;
  }

  const remainingText = rawContent.slice(textStartIndex);

  if (isNonEmptyString(remainingText)) {
    paragraphContent.push({ type: 'text', text: remainingText });
  }

  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: paragraphContent,
      },
    ],
  };
};
