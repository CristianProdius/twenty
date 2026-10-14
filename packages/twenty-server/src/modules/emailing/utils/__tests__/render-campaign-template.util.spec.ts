import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';
import { renderCampaignTemplate } from 'src/modules/emailing/utils/render-campaign-template.util';

const keepValue = (value: string) => value;

describe('renderCampaignTemplate', () => {
  it('renders a plain variable exactly as before, blank when the value is empty', () => {
    expect(
      renderCampaignTemplate({
        template: 'Hi {{jobTitle}} for {{ city }}',
        values: { jobTitle: 'CTO', city: '' },
        encodeValue: keepValue,
      }),
    ).toBe('Hi CTO for ');
  });

  it('renders the fallback when the value is only whitespace', () => {
    expect(
      renderCampaignTemplate({
        template: 'Hi {{jobTitle | default: "there"}}',
        values: { jobTitle: ' \t ' },
        encodeValue: keepValue,
      }),
    ).toBe('Hi there');
  });

  it('renders the value instead of the fallback when the value is set', () => {
    expect(
      renderCampaignTemplate({
        template: 'Hi {{ jobTitle|default:"there" }}',
        values: { jobTitle: ' CTO ' },
        encodeValue: keepValue,
      }),
    ).toBe('Hi  CTO ');
  });

  it('encodes the fallback like a value', () => {
    expect(
      renderCampaignTemplate({
        template:
          '<p>{{jobTitle | default: "<script>alert(\'x\')</script> & co"}}</p>',
        values: {},
        encodeValue: escapeHtml,
      }),
    ).toBe('<p>&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt; &amp; co</p>');
  });
});
