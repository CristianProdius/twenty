import { isNonEmptyString, isString } from '@sniptt/guards';
import type { JSONContent } from '@tiptap/react';
import {
  TIPTAP_NODE_TYPES,
  VARIABLE_WITH_FALLBACK_PATTERN,
  isDefined,
  parseVariableWithFallback,
} from 'twenty-shared/utils';

type FindVariableFallbackArgs = {
  rawContent: string;
  editorContent: JSONContent | undefined;
  name: string;
};

const listEditorContentVariables = (node: JSONContent): string[] => [
  ...(node.type === TIPTAP_NODE_TYPES.VARIABLE_TAG &&
  isString(node.attrs?.variable)
    ? [node.attrs.variable]
    : []),
  ...(node.content ?? []).flatMap(listEditorContentVariables),
];

export const findVariableFallback = ({
  rawContent,
  editorContent,
  name,
}: FindVariableFallbackArgs): string | undefined => {
  const rawContentVariables = Array.from(
    rawContent.matchAll(VARIABLE_WITH_FALLBACK_PATTERN),
    ([variable]) => variable,
  );
  const editorContentVariables = isDefined(editorContent)
    ? listEditorContentVariables(editorContent)
    : [];

  return [...rawContentVariables, ...editorContentVariables]
    .map((variable) => parseVariableWithFallback(variable))
    .find(
      (variableWithFallback) =>
        variableWithFallback?.name === name &&
        isNonEmptyString(variableWithFallback.fallback),
    )?.fallback;
};
