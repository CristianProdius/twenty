import type { JSONContent } from '@tiptap/react';

import { findVariableFallback } from '@/advanced-text-editor/utils/findVariableFallback';

const buildEditorContent = (variables: string[]): JSONContent => ({
  type: 'doc',
  content: [
    {
      type: 'section',
      content: [
        {
          type: 'paragraph',
          content: variables.map((variable) => ({
            type: 'variableTag',
            attrs: { variable },
          })),
        },
      ],
    },
  ],
});

describe('findVariableFallback', () => {
  it('should prefer the raw content fallback over a different editor content fallback', () => {
    expect(
      findVariableFallback({
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
      findVariableFallback({
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
