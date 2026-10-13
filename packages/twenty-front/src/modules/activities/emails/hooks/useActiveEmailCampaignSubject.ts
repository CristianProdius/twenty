import { isString } from '@sniptt/guards';

import { activeEmailCampaignIdState } from '@/activities/emails/states/activeEmailCampaignIdState';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useActiveEmailCampaignSubject = () => {
  const activeEmailCampaignId = useAtomStateValue(activeEmailCampaignIdState);
  const subject = useAtomFamilySelectorValue(recordStoreFamilySelector, {
    recordId: activeEmailCampaignId ?? '',
    fieldName: 'subject',
  });

  return isString(subject) ? subject : '';
};
