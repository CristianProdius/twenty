import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';
import { renderCampaignTemplate } from 'src/modules/emailing/utils/render-campaign-template.util';

const keepValue = (value: string) => value;

describe('renderCampaignTemplate', () => {
  it('renders a plain variable exactly as before, blank when the value is empty', () => {
    expect(
      renderCampaignTemplate(
        'Hi {{jobTitle}} for {{ city }}',
        { jobTitle: 'CTO', city: '' },
        { encodeValue: keepValue },
      ),
    ).toBe('Hi CTO for ');
  });

  it('renders the fallback when the value is only whitespace', () => {
    expect(
      renderCampaignTemplate(
        'Hi {{jobTitle | default: "there"}}',
        { jobTitle: ' \t ' },
        { encodeValue: keepValue },
      ),
    ).toBe('Hi there');
  });

  it('renders the value instead of the fallback when the value is set', () => {
    expect(
      renderCampaignTemplate(
        'Hi {{ jobTitle|default:"there" }}',
        { jobTitle: ' CTO ' },
        { encodeValue: keepValue },
      ),
    ).toBe('Hi  CTO ');
  });

  it('encodes the fallback like a value', () => {
    expect(
      renderCampaignTemplate(
        '<p>{{jobTitle | default: "<script>alert(\'x\')</script> & }}"}}</p>',
        {},
        { encodeValue: escapeHtml },
      ),
    ).toBe('<p>&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt; &amp; }}</p>');
  });
});
