import { activeEmailCampaignIdState } from '@/activities/emails/states/activeEmailCampaignIdState';
import { activeEmailEditorState } from '@/activities/emails/states/activeEmailEditorState';
import { findVariableFallback } from '@/advanced-text-editor/utils/findVariableFallback';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isString } from '@sniptt/guards';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import {
  formatVariableWithFallback,
  listCampaignVariablesForFields,
} from 'twenty-shared/utils';

export const useCampaignEmailEditorVariables = () => {
  const { t } = useLingui();
  const { objectMetadataItem: personObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Person,
    });
  const activeEmailCampaignId = useAtomStateValue(activeEmailCampaignIdState);
  const activeEmailEditor = useAtomStateValue(activeEmailEditorState);
  const subject = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId: activeEmailCampaignId ?? '',
    fieldName: 'subject',
  });

  const variables = [
    ...listCampaignVariablesForFields(personObjectMetadataItem.fields).map(
      ({ label, name }) => ({ label, name }),
    ),
    { label: t`Full name`, name: 'fullName' },
    { label: t`Person ID`, name: 'personId' },
  ];

  const formatVariableWithExistingFallback = (name: string) =>
    formatVariableWithFallback({
      name,
      fallback: findVariableFallback({
        rawContent: isString(subject) ? subject : '',
        editorContent: activeEmailEditor?.getJSON(),
        name,
      }),
    });

  return { variables, formatVariableWithExistingFallback };
};
