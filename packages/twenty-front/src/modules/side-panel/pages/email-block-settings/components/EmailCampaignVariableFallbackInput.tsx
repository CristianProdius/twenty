import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import { type FocusEvent, type FormEvent, useState } from 'react';
import {
  TIPTAP_NODE_TYPES,
  formatCampaignVariable,
  isDefined,
} from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { type CampaignVariableSelectionTarget } from '@/activities/emails/editor/utils/getCampaignVariableSelectionTarget';
import { StyledEmailFieldLabel } from '@/side-panel/pages/email-block-settings/components/StyledEmailFieldLabel';
import { TextInput } from '@/ui/input/components/TextInput';

const StyledFallbackHelper = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
`;

type EmailCampaignVariableFallbackInputProps = {
  editor: Editor;
  target: CampaignVariableSelectionTarget;
};

export const EmailCampaignVariableFallbackInput = ({
  editor,
  target,
}: EmailCampaignVariableFallbackInputProps) => {
  const { t } = useLingui();
  const [fallback, setFallback] = useState(
    target.campaignVariable.fallback ?? '',
  );

  const handleSubmit = (
    event: FormEvent<HTMLFormElement> | FocusEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();

    const variable = formatCampaignVariable({
      name: target.campaignVariable.name,
      fallback,
    });

    editor
      .chain()
      .command(({ tr }) => {
        const node = tr.doc.nodeAt(target.pos);

        if (
          !isDefined(node) ||
          node.type.name !== TIPTAP_NODE_TYPES.VARIABLE_TAG ||
          node.attrs.variable === variable
        ) {
          return false;
        }

        tr.setNodeMarkup(target.pos, undefined, { ...node.attrs, variable });
        return true;
      })
      .run();
  };

  return (
    <form onSubmit={handleSubmit}>
      <StyledEmailFieldLabel>{t`Fallback value`}</StyledEmailFieldLabel>
      <TextInput
        aria-label={t`Fallback value`}
        placeholder={t`Value if variable is empty`}
        value={fallback}
        onChange={setFallback}
        onBlur={handleSubmit}
        fullWidth
      />
      <StyledFallbackHelper>
        {t`In case the variable is empty, this fallback value will be used.`}
      </StyledFallbackHelper>
    </form>
  );
};
