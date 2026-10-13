import { isNonEmptyString } from '@sniptt/guards';
import type { JSONContent } from '@tiptap/react';
import {
  TIPTAP_NODE_TYPES,
  VARIABLE_WITH_FALLBACK_PATTERN,
  isDefined,
} from 'twenty-shared/utils';

export const getInitialVariableWithFallbackEditorContent = (
  rawContent: string,
): JSONContent => {
  const paragraphContent: JSONContent[] = [];
  let textStartIndex = 0;

  for (const match of rawContent.matchAll(VARIABLE_WITH_FALLBACK_PATTERN)) {
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
