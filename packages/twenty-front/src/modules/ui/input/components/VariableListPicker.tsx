import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconVariable, IconVariablePlus } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { VariableListPickerContext } from '@/ui/input/contexts/VariableListPickerContext';
import { type VariablePickerComponent } from '@/ui/input/types/VariablePickerComponent';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

const StyledVariableListPickerContainer = styled.div`
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

export const VariableListPicker: VariablePickerComponent = ({
  instanceId,
  disabled,
  onVariableSelect,
}) => {
  const { t } = useLingui();
  const theme = useTheme();
  const pickerContext = useContext(VariableListPickerContext);

  if (!isDefined(pickerContext)) {
    return null;
  }

  const { variables, formatVariable } = pickerContext;

  return (
    <DropdownRoot
      dropdownId={`variable-list-picker-${instanceId}`}
      type="picker"
    >
      <Dropdown.Trigger
        aria-label={t`Insert variable`}
        nativeButton={false}
        disabled={disabled}
        render={<StyledVariableListPickerContainer />}
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
              onSelect={() => onVariableSelect(formatVariable(name))}
            >
              {label}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
