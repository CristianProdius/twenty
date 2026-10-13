import type { JSONContent } from '@tiptap/react';

import { findCampaignVariableFallback } from '@/activities/emails/editor/utils/findCampaignVariableFallback';

const buildBodyDocument = (variables: string[]): JSONContent => ({
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

describe('findCampaignVariableFallback', () => {
  it('should prefer the subject fallback over a different body fallback', () => {
    expect(
      findCampaignVariableFallback({
        subject: 'Hi {{name.firstName | default: "there"}}',
        bodyDocument: buildBodyDocument([
          '{{name.firstName | default: "friend"}}',
        ]),
        name: 'name.firstName',
      }),
    ).toBe('there');
  });

  it('should find a fallback on a chip nested in the body', () => {
    expect(
      findCampaignVariableFallback({
        subject: 'Hi {{name.firstName}}',
        bodyDocument: buildBodyDocument([
          '{{jobTitle | default: "builder"}}',
          '{{name.firstName}}',
          '{{name.firstName | default: "friend"}}',
        ]),
        name: 'name.firstName',
      }),
    ).toBe('friend');
  });
});
