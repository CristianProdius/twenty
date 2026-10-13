import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type NodeViewProps } from '@tiptap/react';
import { isDefined, parseCampaignVariable } from 'twenty-shared/utils';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { useTheme } from 'twenty-ui/theme';

import { VariableChip } from '@/advanced-text-editor/extensions/variable-tag/VariableChip';
import { useOpenEmailBlockStyleInSidePanel } from '@/side-panel/hooks/useOpenEmailBlockStyleInSidePanel';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';

const StyledMissingFallbackIcon = styled.span`
  display: flex;
`;

type CampaignVariableChipProps = NodeViewProps;

export const CampaignVariableChip = ({
  deleteNode,
  editor,
  getPos,
  node,
  selected,
}: CampaignVariableChipProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { openEmailBlockStyleInSidePanel } =
    useOpenEmailBlockStyleInSidePanel();

  const variable =
    typeof node.attrs.variable === 'string' ? node.attrs.variable : '';
  const campaignVariable = parseCampaignVariable(variable);

  if (!isDefined(campaignVariable) || !editor.isEditable) {
    return (
      <VariableChip deleteNode={deleteNode} editor={editor} label={variable} />
    );
  }

  const label = `{{${campaignVariable.name}}}`;

  const handleClick = () => {
    const position = getPos();

    if (!isDefined(position)) {
      return;
    }

    editor.commands.setNodeSelection(position);
    openEmailBlockStyleInSidePanel();
  };

  return (
    <VariableChip
      deleteNode={deleteNode}
      editor={editor}
      label={label}
      title={variable}
      selected={selected}
      onClick={handleClick}
      leftIcon={
        isNonEmptyString(campaignVariable.fallback) ? undefined : (
          <Tooltip
            content={t`Add a fallback value to avoid empty personalization`}
            delay={TooltipDelay.shortDelay}
          >
            <StyledMissingFallbackIcon>
              <IconAlertTriangle
                size={theme.icon.size.sm}
                stroke={theme.icon.stroke.sm}
                color={theme.color.orange}
              />
            </StyledMissingFallbackIcon>
          </Tooltip>
        )
      }
    />
  );
};
