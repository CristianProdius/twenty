import type { JSONContent } from '@tiptap/react';

import { findTemplateVariableFallback } from '@/advanced-text-editor/utils/findTemplateVariableFallback';

const buildEditorContent = (rawTemplateVariables: string[]): JSONContent => ({
  type: 'doc',
  content: [
    {
      type: 'section',
      content: [
        {
          type: 'paragraph',
          content: rawTemplateVariables.map((rawTemplateVariable) => ({
            type: 'variableTag',
            attrs: { variable: rawTemplateVariable },
          })),
        },
      ],
    },
  ],
});

describe('findTemplateVariableFallback', () => {
  it('should prefer the raw content fallback over a different editor content fallback', () => {
    expect(
      findTemplateVariableFallback({
        rawContent: 'Hi {{name.firstName | default: "there"}}',
        editorContent: buildEditorContent([
          '{{name.firstName | default: "friend"}}',
        ]),
        name: 'name.firstName',
      }),
    ).toBe('there');
  });

  it('should find a fallback on a chip nested in the editor content', () => {
    expect(
      findTemplateVariableFallback({
        rawContent: 'Hi {{name.firstName}}',
        editorContent: buildEditorContent([
          '{{jobTitle | default: "builder"}}',
          '{{name.firstName}}',
          '{{name.firstName | default: "friend"}}',
        ]),
        name: 'name.firstName',
      }),
    ).toBe('friend');
  });
});
