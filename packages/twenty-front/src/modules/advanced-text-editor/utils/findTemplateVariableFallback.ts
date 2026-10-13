import { isNonEmptyString, isString } from '@sniptt/guards';
import type { JSONContent } from '@tiptap/react';
import {
  TEMPLATE_VARIABLE_WITH_FALLBACK_PATTERN,
  TIPTAP_NODE_TYPES,
  isDefined,
  parseTemplateVariableWithFallback,
} from 'twenty-shared/utils';

type FindTemplateVariableFallbackArgs = {
  rawContent: string;
  editorContent: JSONContent | undefined;
  name: string;
};

const listEditorContentRawTemplateVariables = (node: JSONContent): string[] => [
  ...(node.type === TIPTAP_NODE_TYPES.VARIABLE_TAG &&
  isString(node.attrs?.variable)
    ? [node.attrs.variable]
    : []),
  ...(node.content ?? []).flatMap(listEditorContentRawTemplateVariables),
];

export const findTemplateVariableFallback = ({
  rawContent,
  editorContent,
  name,
}: FindTemplateVariableFallbackArgs): string | undefined => {
  const rawContentRawTemplateVariables = Array.from(
    rawContent.matchAll(TEMPLATE_VARIABLE_WITH_FALLBACK_PATTERN),
    ([rawTemplateVariable]) => rawTemplateVariable,
  );
  const editorContentRawTemplateVariables = isDefined(editorContent)
    ? listEditorContentRawTemplateVariables(editorContent)
    : [];

  return [
    ...rawContentRawTemplateVariables,
    ...editorContentRawTemplateVariables,
  ]
    .map((rawTemplateVariable) =>
      parseTemplateVariableWithFallback(rawTemplateVariable),
    )
    .find(
      (templateVariableWithFallback) =>
        templateVariableWithFallback?.name === name &&
        isNonEmptyString(templateVariableWithFallback.fallback),
    )?.fallback;
};
