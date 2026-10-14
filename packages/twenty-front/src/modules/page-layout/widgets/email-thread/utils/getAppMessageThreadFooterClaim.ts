import { type SidePanelFooterCommandMenuItem } from '@/ui/layout/side-panel/types/SidePanelFooterCommandMenuItem';

// Claims the side-panel footer so the email Reply command is hidden while the
// inline APP chat composer is shown. Empty label keeps the claim invisible.
export const APP_MESSAGE_THREAD_FOOTER_CLAIM_ID =
  'app-message-thread-owns-footer';

export const getAppMessageThreadFooterClaim =
  (): SidePanelFooterCommandMenuItem[] => [
    {
      id: APP_MESSAGE_THREAD_FOOTER_CLAIM_ID,
      label: '',
      isPinned: true,
      onClick: () => undefined,
    },
  ];

export const filterVisibleSidePanelWidgetFooterCommandMenuItems = (
  footerCommandMenuItems: SidePanelFooterCommandMenuItem[],
): SidePanelFooterCommandMenuItem[] =>
  footerCommandMenuItems.filter(
    (commandMenuItem) => commandMenuItem.label.trim().length > 0,
  );
