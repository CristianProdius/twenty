import { parseCampaignVariable } from '../parse-campaign-variable';

describe('parseCampaignVariable', () => {
  it('should read a variable without a fallback', () => {
    expect(parseCampaignVariable('{{ name.firstName }}')).toEqual({
      name: 'name.firstName',
    });
  });

  it('should read a Liquid default filter as the fallback', () => {
    expect(parseCampaignVariable('{{jobTitle | default: "there"}}')).toEqual({
      name: 'jobTitle',
      fallback: 'there',
    });
    expect(
      parseCampaignVariable('{{ name.firstName|default:"Mr. X }}" }}'),
    ).toEqual({ name: 'name.firstName', fallback: 'Mr. X }}' });
  });

  it('should unescape quotes and backslashes in the fallback', () => {
    expect(
      parseCampaignVariable('{{jobTitle | default: "the \\"boss\\" \\\\o/"}}'),
    ).toEqual({ name: 'jobTitle', fallback: 'the "boss" \\o/' });
  });

  it('should reject near-miss fallback syntax', () => {
    expect(parseCampaignVariable('{{jobTitle | there}}')).toBeUndefined();
    expect(parseCampaignVariable('{{jobTitle | "there"}}')).toBeUndefined();
    expect(
      parseCampaignVariable('{{jobTitle | default: there}}'),
    ).toBeUndefined();
    expect(
      parseCampaignVariable("{{jobTitle | default: 'there'}}"),
    ).toBeUndefined();
    expect(
      parseCampaignVariable('{{jobTitle | default: “there”}}'),
    ).toBeUndefined();
  });

  it('should reject anything that is not exactly one variable', () => {
    expect(parseCampaignVariable('Hi {{jobTitle}}')).toBeUndefined();
    expect(parseCampaignVariable('{{job-title}}')).toBeUndefined();
  });
});
