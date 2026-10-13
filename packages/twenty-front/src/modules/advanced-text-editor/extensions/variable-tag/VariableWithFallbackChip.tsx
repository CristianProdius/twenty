import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useId } from 'react';
import {
  formatVariableWithFallback,
  isDefined,
  parseVariableWithFallback,
} from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { TextInputDropdownForm } from '@/advanced-text-editor/components/TextInputDropdownForm';
import { VariableChip } from '@/advanced-text-editor/extensions/variable-tag/VariableChip';
import { BaseChip } from '@/ui/input/components/BaseChip';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';

const StyledWrapper = styled.span`
  display: inline-block;
  padding-inline: ${themeCssVariables.spacing[0.5]};
`;

const StyledMissingFallbackIcon = styled.span`
  display: flex;
`;

type VariableWithFallbackChipProps = NodeViewProps;

export const VariableWithFallbackChip = ({
  deleteNode,
  editor,
  node,
  updateAttributes,
}: VariableWithFallbackChipProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const dropdownId = `variable-fallback-dropdown-${useId()}`;
  const { closeDropdown } = useCloseDropdown();

  const variable =
    typeof node.attrs.variable === 'string' ? node.attrs.variable : '';
  const variableWithFallback = parseVariableWithFallback(variable);

  if (!isDefined(variableWithFallback) || !editor.isEditable) {
    return (
      <VariableChip deleteNode={deleteNode} editor={editor} label={variable} />
    );
  }

  const handleFallbackSubmit = (fallback: string) => {
    const nextVariable = formatVariableWithFallback({
      name: variableWithFallback.name,
      fallback,
    });

    closeDropdown(dropdownId);
    editor.commands.focus();

    if (nextVariable !== variable) {
      updateAttributes({ variable: nextVariable });
    }
  };

  return (
    <NodeViewWrapper as={StyledWrapper} style={{ whiteSpace: 'nowrap' }}>
      <DropdownRoot dropdownId={dropdownId} type="panel">
        <Dropdown.Trigger render={<span />} nativeButton={false} tabIndex={-1}>
          <BaseChip
            label={`{{${variableWithFallback.name}}}`}
            title={variable}
            leftIcon={
              isNonEmptyString(variableWithFallback.fallback) ? undefined : (
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
            onRemove={(event) => {
              event.stopPropagation();
              deleteNode();
            }}
            removeAriaLabel={t`Remove variable`}
          />
        </Dropdown.Trigger>
        <DropdownContent
          align="start"
          finalFocus={(interaction) =>
            interaction === 'keyboard' ? editor.view.dom : false
          }
          aria-label={t`Fallback value`}
        >
          <Dropdown.Section>
            <TextInputDropdownForm
              defaultValue={variableWithFallback.fallback ?? ''}
              label={t`Fallback value`}
              onSubmit={handleFallbackSubmit}
            />
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
    </NodeViewWrapper>
  );
};
