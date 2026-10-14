import { EMAIL_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { compileCampaignEmailContent } from 'src/modules/emailing/utils/compile-campaign-email-content.util';

jest.mock(
  'src/engine/core-modules/email/utils/compile-outbound-email-content.util',
  () => ({
    compileOutboundEmailContent: jest.fn().mockResolvedValue({
      html: '<p>rendered html</p>',
      plainText: 'rendered html',
    }),
  }),
);

const { compileOutboundEmailContent } = jest.requireMock(
  'src/engine/core-modules/email/utils/compile-outbound-email-content.util',
);

const VALUES = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  personId: 'person-123',
};

const serializeDocument = (content?: unknown[]) =>
  JSON.stringify({
    type: 'doc',
    attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
    ...(content === undefined ? {} : { content }),
  });

const buildDocument = (text: string) =>
  serializeDocument([{ type: 'paragraph', content: [{ type: 'text', text }] }]);

const compiledDocument = () => compileOutboundEmailContent.mock.calls[0][0];

describe('compileCampaignEmailContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render a TipTap document through the email renderer', async () => {
    const content = await compileCampaignEmailContent({
      bodyTemplate: buildDocument('Hello there'),
      values: VALUES,
    });

    expect(content).toEqual({
      html: '<p>rendered html</p>',
      plainText: 'rendered html',
    });
    expect(compiledDocument()).toEqual({
      type: 'doc',
      attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Hello there' }],
        },
      ],
    });
  });

  it('should substitute variables inside text nodes', async () => {
    await compileCampaignEmailContent({
      bodyTemplate: buildDocument('Hi {{firstName}}, from {{fullName}}'),
      values: VALUES,
    });

    expect(compiledDocument().content[0].content[0].text).toBe(
      'Hi Ada, from Ada Lovelace',
    );
  });

  it('should substitute variables carried by variable chip attributes', async () => {
    await compileCampaignEmailContent({
      bodyTemplate: serializeDocument([
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Dear ' },
            { type: 'variableTag', attrs: { variable: '{{firstName}}' } },
          ],
        },
      ]),
      values: VALUES,
    });

    expect(compiledDocument().content[0].content[1]).toEqual({
      type: 'text',
      text: 'Ada',
    });
  });

  it('should substitute variables inside button and link URLs', async () => {
    await compileCampaignEmailContent({
      bodyTemplate: serializeDocument([
        {
          type: 'button',
          attrs: { href: 'https://example.com/p/{{personId}}' },
          content: [{ type: 'text', text: 'Open' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'here',
              marks: [
                {
                  type: 'link',
                  attrs: { href: 'https://example.com/u/{{personId}}' },
                },
              ],
            },
          ],
        },
      ]),
      values: VALUES,
    });

    expect(compiledDocument().content[0].attrs.href).toBe(
      'https://example.com/p/person-123',
    );
    expect(compiledDocument().content[1].content[0].marks[0].attrs.href).toBe(
      'https://example.com/u/person-123',
    );
  });

  it('should percent-encode a URL fallback like the real send does', async () => {
    await compileCampaignEmailContent({
      bodyTemplate: serializeDocument([
        {
          type: 'button',
          attrs: { href: '{{website | default: "https://twenty.com/a b"}}' },
          content: [{ type: 'text', text: 'Open' }],
        },
      ]),
      values: VALUES,
    });

    expect(compiledDocument().content[0].attrs.href).toBe(
      'https%3A%2F%2Ftwenty.com%2Fa%20b',
    );
  });

  it('should substitute variables inside image link URLs', async () => {
    await compileCampaignEmailContent({
      bodyTemplate: serializeDocument([
        {
          type: 'image',
          attrs: {
            src: 'https://example.com/{{personId}}/banner.png',
            href: 'https://example.com/promo/{{personId}}',
            alt: 'Banner for {{firstName}}',
          },
        },
      ]),
      values: VALUES,
    });

    expect(compiledDocument().content[0].attrs.href).toBe(
      'https://example.com/promo/person-123',
    );
    expect(compiledDocument().content[0].attrs.src).toBe(
      'https://example.com/person-123/banner.png',
    );
    expect(compiledDocument().content[0].attrs.alt).toBe('Banner for Ada');
  });

  it('should substitute variables inside raw HTML blocks with escaping', async () => {
    await compileCampaignEmailContent({
      bodyTemplate: serializeDocument([
        {
          type: 'html',
          attrs: {
            html: '<a href="https://example.com/p/{{personId}}">Hi {{firstName}}</a>',
          },
        },
      ]),
      values: { ...VALUES, firstName: '<b>Ada</b>' },
    });

    expect(compiledDocument().content[0].attrs.html).toBe(
      '<a href="https://example.com/p/person-123">Hi &lt;b&gt;Ada&lt;/b&gt;</a>',
    );
  });

  it('should substitute variables nested under marks and lists', async () => {
    const document = serializeDocument([
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Dear {{firstName}}',
                    marks: [{ type: 'bold' }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]);

    await compileCampaignEmailContent({
      bodyTemplate: document,
      values: VALUES,
    });

    const textNode =
      compiledDocument().content[0].content[0].content[0].content[0];

    expect(textNode.text).toBe('Dear Ada');
    expect(textNode.marks).toEqual([{ type: 'bold' }]);
  });

  it('should replace unknown variables with an empty string', async () => {
    await compileCampaignEmailContent({
      bodyTemplate: buildDocument('Hi {{unknown}}!'),
      values: VALUES,
    });

    expect(compiledDocument().content[0].content[0].text).toBe('Hi !');
  });

  it('should leave a value containing markup for the renderer to escape', async () => {
    await compileCampaignEmailContent({
      bodyTemplate: buildDocument('{{firstName}}'),
      values: { ...VALUES, firstName: '<script>alert(1)</script>' },
    });

    expect(compiledDocument().content[0].content[0].text).toBe(
      '<script>alert(1)</script>',
    );
  });

  it('should keep placeholders in place when no values are given', async () => {
    await compileCampaignEmailContent({
      bodyTemplate: buildDocument('Hi {{firstName}}'),
      values: null,
    });

    expect(compiledDocument().content[0].content[0].text).toBe(
      'Hi {{firstName}}',
    );
  });

  it('should render an empty body as empty without calling the renderer', async () => {
    expect(
      await compileCampaignEmailContent({ bodyTemplate: '', values: VALUES }),
    ).toEqual({
      html: '',
      plainText: '',
    });
    expect(
      await compileCampaignEmailContent({
        bodyTemplate: '   ',
        values: VALUES,
      }),
    ).toEqual({
      html: '',
      plainText: '',
    });
    expect(compileOutboundEmailContent).not.toHaveBeenCalled();
  });

  it('should reject a body that is not JSON', async () => {
    await expect(
      compileCampaignEmailContent({
        bodyTemplate: '<p>Hi {{firstName}}</p>',
        values: VALUES,
      }),
    ).rejects.toThrow('not a renderable email document');
  });

  it('should reject a JSON value that is not a document', async () => {
    await expect(
      compileCampaignEmailContent({
        bodyTemplate: '{"foo":"bar"}',
        values: VALUES,
      }),
    ).rejects.toMatchObject({
      code: EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
    });

    await expect(
      compileCampaignEmailContent({
        bodyTemplate: '{"foo":"bar"}',
        values: VALUES,
      }),
    ).rejects.toBeInstanceOf(EmailingDomainException);
  });

  it('should reject a document with a non-array content', async () => {
    await expect(
      compileCampaignEmailContent({
        bodyTemplate: JSON.stringify({
          type: 'doc',
          attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
          content: 'not an array',
        }),
        values: VALUES,
      }),
    ).rejects.toThrow('not a renderable email document');
  });

  it('should render a document with no content at all', async () => {
    const content = await compileCampaignEmailContent({
      bodyTemplate: serializeDocument(),
      values: VALUES,
    });

    expect(content.html).toBe('<p>rendered html</p>');
    expect(compiledDocument()).toEqual({
      type: 'doc',
      attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
    });
  });

  it('should reject a versionless document', async () => {
    await expect(
      compileCampaignEmailContent({
        bodyTemplate: JSON.stringify({ type: 'doc', content: [] }),
        values: VALUES,
      }),
    ).rejects.toThrow('not a renderable email document');
  });
});
