import { formatCampaignVariable } from '../format-campaign-variable';
import { parseCampaignVariable } from '../parse-campaign-variable';

describe('formatCampaignVariable', () => {
  it('should write a bare variable when the fallback is empty', () => {
    expect(formatCampaignVariable({ name: 'jobTitle', fallback: '' })).toBe(
      '{{jobTitle}}',
    );
  });

  it('should write the fallback as a Liquid default filter', () => {
    expect(
      formatCampaignVariable({ name: 'name.firstName', fallback: 'there' }),
    ).toBe('{{name.firstName | default: "there"}}');
  });

  it('should round-trip a fallback containing quotes, backslashes and braces', () => {
    const campaignVariable = {
      name: 'jobTitle',
      fallback: 'the "boss" C:\\temp\\ }} <b>',
    };

    expect(
      parseCampaignVariable(formatCampaignVariable(campaignVariable)),
    ).toEqual(campaignVariable);
  });
});
