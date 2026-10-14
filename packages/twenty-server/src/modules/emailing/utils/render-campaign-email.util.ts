import { compileCampaignEmailContent } from 'src/modules/emailing/utils/compile-campaign-email-content.util';
import { renderCampaignTemplate } from 'src/modules/emailing/utils/render-campaign-template.util';

export const renderCampaignEmail = async ({
  subjectTemplate,
  bodyTemplate,
  values,
}: {
  subjectTemplate: string;
  bodyTemplate: string;
  values: Record<string, string>;
}): Promise<{ subject: string; html: string; plainText: string }> => {
  const { html, plainText } = await compileCampaignEmailContent({
    bodyTemplate,
    values,
  });

  return {
    subject: renderCampaignTemplate({
      template: subjectTemplate,
      values,
      encodeValue: (value) => value,
    }),
    html,
    plainText,
  };
};
