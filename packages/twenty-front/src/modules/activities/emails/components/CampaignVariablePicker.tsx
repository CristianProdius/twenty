import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { formatVariableWithFallback } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconVariable, IconVariablePlus } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useActiveEmailCampaignSubject } from '@/activities/emails/hooks/useActiveEmailCampaignSubject';
import { useCampaignEmailEditorVariables } from '@/activities/emails/hooks/useCampaignEmailEditorVariables';
import { activeEmailEditorState } from '@/activities/emails/states/activeEmailEditorState';
import { findVariableFallback } from '@/advanced-text-editor/utils/findVariableFallback';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { type VariablePickerComponent } from '@/ui/input/types/VariablePickerComponent';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledCampaignVariablePickerContainer = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 0 ${themeCssVariables.border.radius.sm}
    ${themeCssVariables.border.radius.sm} 0;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[2]};

  &:hover {
    background-color: ${themeCssVariables.background.transparent.light};
  }
`;

export const CampaignVariablePicker: VariablePickerComponent = ({
  instanceId,
  onVariableSelect,
}) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { variables } = useCampaignEmailEditorVariables();
  const subject = useActiveEmailCampaignSubject();
  const activeEmailEditor = useAtomStateValue(activeEmailEditorState);

  const handleVariableSelect = (name: string) =>
    onVariableSelect(
      formatVariableWithFallback({
        name,
        fallback: findVariableFallback({
          rawContent: subject,
          editorContent: activeEmailEditor?.getJSON(),
          name,
        }),
      }),
    );

  return (
    <DropdownRoot
      dropdownId={`campaign-variable-picker-${instanceId}`}
      type="picker"
    >
      <Dropdown.Trigger
        aria-label={t`Insert variable`}
        nativeButton={false}
        render={<StyledCampaignVariablePickerContainer />}
      >
        <IconVariablePlus size={theme.icon.size.md} />
      </Dropdown.Trigger>
      <DropdownContent
        align="end"
        sideOffset={4}
        width={GenericDropdownContentWidth.Large}
      >
        <Dropdown.Section scrollable>
          {variables.map(({ label, name }) => (
            <Dropdown.OptionItem
              key={name}
              startIcon={<SelectOptionIcon Icon={IconVariable} />}
              onSelect={() => handleVariableSelect(name)}
            >
              {label}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
