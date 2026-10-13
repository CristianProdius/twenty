import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState, type FocusEvent, type FormEvent } from 'react';
import {
  type CampaignVariable,
  formatCampaignVariable,
} from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { TextInput } from '@/ui/input/components/TextInput';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledFallbackHelper = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
`;

type CampaignVariableFallbackDropdownFormProps = {
  campaignVariable: CampaignVariable;
  onSubmit: (variable: string) => void;
};

export const CampaignVariableFallbackDropdownForm = ({
  campaignVariable,
  onSubmit,
}: CampaignVariableFallbackDropdownFormProps) => {
  const { t } = useLingui();
  const [fallback, setFallback] = useState(campaignVariable.fallback ?? '');
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
  );
  const { closeDropdown } = useCloseDropdown();

  const handleSubmit = (
    event: FormEvent<HTMLFormElement> | FocusEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();

    if (!isDropdownOpen) {
      return;
    }

    closeDropdown();
    onSubmit(formatCampaignVariable({ name: campaignVariable.name, fallback }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        label={t`Fallback value`}
        placeholder={t`Value if variable is empty`}
        value={fallback}
        onChange={setFallback}
        onBlur={handleSubmit}
        autoFocus
        fullWidth
      />
      <StyledFallbackHelper>
        {t`In case the variable is empty, this fallback value will be used.`}
      </StyledFallbackHelper>
    </form>
  );
};
