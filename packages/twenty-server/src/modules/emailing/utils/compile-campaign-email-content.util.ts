import { msg } from '@lingui/core/macro';
import {
  isDefined,
  parseCanonicalEmailDocument,
  parseJson,
} from 'twenty-shared/utils';

import { type CompiledOutboundEmailContent } from 'src/engine/core-modules/email/types/compiled-outbound-email-content.type';
import { compileOutboundEmailContent } from 'src/engine/core-modules/email/utils/compile-outbound-email-content.util';
import { resolveEmailDocumentBindings } from 'src/engine/core-modules/email/utils/resolve-email-document-bindings.util';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';
import { renderCampaignTemplate } from 'src/modules/emailing/utils/render-campaign-template.util';

export const compileCampaignEmailContent = async ({
  bodyTemplate,
  values,
}: {
  bodyTemplate: string;
  values: Record<string, string> | null;
}): Promise<CompiledOutboundEmailContent> => {
  if (bodyTemplate.trim() === '') {
    return { html: '', plainText: '' };
  }

  const parseResult = parseCanonicalEmailDocument(
    parseJson<unknown>(bodyTemplate),
  );

  if (!parseResult.success) {
    throw new EmailingDomainException(
      `Campaign bodyTemplate is not a renderable email document: ${parseResult.error}`,
      EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
      { userFriendlyMessage: msg`This campaign's email content is invalid.` },
    );
  }

  return compileOutboundEmailContent(
    isDefined(values)
      ? resolveEmailDocumentBindings(parseResult.document, (value, context) =>
          renderCampaignTemplate({
            template: value,
            values,
            encodeValue: {
              html: escapeHtml,
              rawHtml: escapeHtml,
              text: (variableValue: string) => variableValue,
              url: encodeURIComponent,
            }[context],
          }),
        )
      : parseResult.document,
  );
};
