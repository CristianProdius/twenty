import { useLingui } from '@lingui/react/macro';
import { useState, type FocusEvent, type FormEvent } from 'react';
import {
  type CampaignVariable,
  formatCampaignVariable,
} from 'twenty-shared/utils';

import { TextInput } from '@/ui/input/components/TextInput';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

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
        aria-label={t`Fallback value`}
        placeholder={t`Fallback value`}
        value={fallback}
        onChange={setFallback}
        onBlur={handleSubmit}
        autoFocus
      />
    </form>
  );
};
