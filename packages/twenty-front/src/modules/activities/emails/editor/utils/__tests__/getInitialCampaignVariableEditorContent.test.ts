import { getInitialCampaignVariableEditorContent } from '@/activities/emails/editor/utils/getInitialCampaignVariableEditorContent';
import { parseEditorContent } from '@/workflow/workflow-variables/utils/parseEditorContent';

const getVariableTags = (rawContent: string) =>
  getInitialCampaignVariableEditorContent(rawContent)
    .content?.[0]?.content?.filter(({ type }) => type === 'variableTag')
    .map(({ attrs }) => attrs?.variable);

const roundTrip = (rawContent: string) =>
  parseEditorContent(getInitialCampaignVariableEditorContent(rawContent));

describe('getInitialCampaignVariableEditorContent', () => {
  it('should turn a variable with a fallback into a single chip', () => {
    const subject = 'Hi {{name.firstName | default: "there"}}, welcome!';

    expect(getVariableTags(subject)).toEqual([
      '{{name.firstName | default: "there"}}',
    ]);
    expect(roundTrip(subject)).toBe(subject);
  });

  it('should keep a fallback with escaped quotes and braces in one chip', () => {
    const variable = '{{jobTitle | default: "the \\"boss\\" }} {x}"}}';
    const subject = `For ${variable} only`;

    expect(getVariableTags(subject)).toEqual([variable]);
    expect(roundTrip(subject)).toBe(subject);
  });

  it('should split adjacent variables into separate chips', () => {
    const subject = '{{name.firstName}}{{jobTitle | default: "you"}} {{city}}';

    expect(getVariableTags(subject)).toEqual([
      '{{name.firstName}}',
      '{{jobTitle | default: "you"}}',
      '{{city}}',
    ]);
    expect(roundTrip(subject)).toBe(subject);
  });

  it('should leave plain text and invalid variables as text', () => {
    const subject = 'Our {{job-title}} sale, 50% off {not a variable}';

    expect(getVariableTags(subject)).toEqual([]);
    expect(roundTrip(subject)).toBe(subject);
  });
});
