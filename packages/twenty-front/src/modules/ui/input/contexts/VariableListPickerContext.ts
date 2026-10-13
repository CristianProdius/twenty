import { createContext } from 'react';

export const VariableListPickerContext = createContext<{
  variables: { label: string; name: string }[];
  formatVariable: (name: string) => string;
} | null>(null);
