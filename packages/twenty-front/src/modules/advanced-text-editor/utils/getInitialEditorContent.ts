import { isNonEmptyString } from '@sniptt/guards';
import type { JSONContent } from '@tiptap/react';
import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from 'twenty-shared/workflow';

export const getInitialEditorContent = (
  rawContent: string,
  variableTagPattern: RegExp = CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
): JSONContent => {
  const paragraphContent: JSONContent[] = [];
  const lines = rawContent.split(/\n/);

  const pushText = (text: string) => {
    if (isNonEmptyString(text)) {
      paragraphContent.push({
        type: 'text',
        text,
      });
    }
  };

  lines.forEach((line, index) => {
    let textStartIndex = 0;

    for (const match of line.matchAll(variableTagPattern)) {
      const [variable] = match;

      pushText(line.slice(textStartIndex, match.index));
      paragraphContent.push({
        type: 'variableTag',
        attrs: { variable },
      });
      textStartIndex = match.index + variable.length;
    }

    pushText(line.slice(textStartIndex));

    if (index < lines.length - 1) {
      paragraphContent.push({
        type: 'hardBreak',
      });
    }
  });

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
