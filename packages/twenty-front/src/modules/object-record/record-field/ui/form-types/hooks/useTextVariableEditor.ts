import { VariableWithFallbackTag } from '@/advanced-text-editor/extensions/variable-tag/VariableWithFallbackTag';
import { getInitialEditorContent } from '@/advanced-text-editor/utils/getInitialEditorContent';
import { WorkflowVariableTag } from '@/workflow/workflow-variables/extensions/WorkflowVariableTag';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { Placeholder } from '@tiptap/extensions/placeholder';
import { UndoRedo } from '@tiptap/extensions/undo-redo';
import { Slice } from '@tiptap/pm/model';

import { type Editor, useEditor } from '@tiptap/react';
import { useEffect } from 'react';
import {
  isDefined,
  parseJson,
  VARIABLE_WITH_FALLBACK_PATTERN,
} from 'twenty-shared/utils';
import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from 'twenty-shared/workflow';
import { type JsonValue } from 'type-fest';

type UseTextVariableEditorProps = {
  placeholder: string | undefined;
  multiline: boolean | undefined;
  readonly: boolean | undefined;
  defaultValue: string | undefined | null;
  onUpdate: (editor: Editor) => void;
  ariaLabelledBy?: string;
  ariaLabel?: string;
  enableVariableFallback?: boolean;
};

const isJsonObject = (text: string): boolean => {
  try {
    const parsed = JSON.parse(text);
    return parsed !== null && typeof parsed === 'object';
  } catch {
    return false;
  }
};

export const useTextVariableEditor = ({
  placeholder,
  multiline,
  readonly,
  defaultValue,
  onUpdate,
  ariaLabelledBy,
  ariaLabel,
  enableVariableFallback = false,
}: UseTextVariableEditorProps) => {
  const variableTagExtension = enableVariableFallback
    ? VariableWithFallbackTag
    : WorkflowVariableTag;
  const variableTagPattern = enableVariableFallback
    ? VARIABLE_WITH_FALLBACK_PATTERN
    : CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX;

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder,
      }),
      variableTagExtension,
      ...(multiline
        ? [
            HardBreak.configure({
              keepMarks: false,
            }),
          ]
        : []),
      UndoRedo,
    ],
    content: isDefined(defaultValue)
      ? getInitialEditorContent(defaultValue, variableTagPattern)
      : undefined,
    editable: !readonly,
    onUpdate: ({ editor }) => {
      onUpdate(editor);
    },
    editorProps: {
      // Re-applied props replace Tiptap's default attributes, so the role must be restated.
      attributes: {
        role: 'textbox',
        ...(isDefined(ariaLabelledBy)
          ? { 'aria-labelledby': ariaLabelledBy }
          : {}),
        ...(isDefined(ariaLabel) ? { 'aria-label': ariaLabel } : {}),
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();

          if (multiline === true) {
            const { state } = view;
            const { tr } = state;
            const transaction = tr.replaceSelectionWith(
              state.schema.nodes.hardBreak.create(),
            );

            view.dispatch(transaction);
          }

          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const plainText = event.clipboardData?.getData('text/plain') ?? '';
        const {
          state: { schema, tr },
        } = view;

        if (isJsonObject(plainText)) {
          const parsedJson = parseJson<JsonValue>(plainText);
          const formattedJson = multiline
            ? JSON.stringify(parsedJson, null, 2)
            : JSON.stringify(parsedJson);
          const docNode = schema.nodeFromJSON(
            getInitialEditorContent(formattedJson, variableTagPattern),
          );
          const inlineContent = docNode.firstChild?.content;

          if (inlineContent && inlineContent.size > 0) {
            tr.replaceSelection(new Slice(inlineContent, 0, 0));
            view.dispatch(tr);
          }
          return true;
        }

        const pastesLines = multiline && plainText.includes('\n');
        const pastesVariables =
          !plainText.includes('\n') &&
          isDefined(plainText.match(variableTagPattern));

        if (pastesLines || pastesVariables) {
          const docNode = schema.nodeFromJSON(
            getInitialEditorContent(plainText, variableTagPattern),
          );
          const inlineContent = docNode.firstChild?.content;

          if (inlineContent && inlineContent.size > 0) {
            tr.replaceSelection(new Slice(inlineContent, 0, 0));
            view.dispatch(tr);
            return true;
          }
          return false;
        }

        return false;
      },
    },
    enableInputRules: false,
    enablePasteRules: false,
    injectCSS: false,
  });

  useEffect(() => {
    editor?.setEditable(!readonly, false);
  }, [editor, readonly]);

  return editor;
};
