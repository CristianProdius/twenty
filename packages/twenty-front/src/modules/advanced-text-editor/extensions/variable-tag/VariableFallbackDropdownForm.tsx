import { useLingui } from '@lingui/react/macro';
import { useState, type FocusEvent, type FormEvent } from 'react';
import {
  formatVariableWithFallback,
  type VariableWithFallback,
} from 'twenty-shared/utils';

import { TextInput } from '@/ui/input/components/TextInput';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

type VariableFallbackDropdownFormProps = {
  variableWithFallback: VariableWithFallback;
  onSubmit: (variable: string) => void;
};

export const VariableFallbackDropdownForm = ({
  variableWithFallback,
  onSubmit,
}: VariableFallbackDropdownFormProps) => {
  const { t } = useLingui();
  const [fallback, setFallback] = useState(variableWithFallback.fallback ?? '');
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
    onSubmit(
      formatVariableWithFallback({ name: variableWithFallback.name, fallback }),
    );
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
