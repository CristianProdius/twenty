import {
  APP_MESSAGE_THREAD_FOOTER_CLAIM_ID,
  filterVisibleSidePanelWidgetFooterCommandMenuItems,
  getAppMessageThreadFooterClaim,
} from '@/page-layout/widgets/email-thread/utils/getAppMessageThreadFooterClaim';

describe('getAppMessageThreadFooterClaim', () => {
  it('returns a pinned footer claim that suppresses the email Reply command', () => {
    const claim = getAppMessageThreadFooterClaim();

    expect(claim).toHaveLength(1);
    expect(claim[0].id).toBe(APP_MESSAGE_THREAD_FOOTER_CLAIM_ID);
    expect(claim[0].isPinned).toBe(true);
    expect(claim[0].label).toBe('');
  });
});

describe('filterVisibleSidePanelWidgetFooterCommandMenuItems', () => {
  it('hides empty-label claim items from the footer buttons', () => {
    expect(
      filterVisibleSidePanelWidgetFooterCommandMenuItems([
        ...getAppMessageThreadFooterClaim(),
        {
          id: 'send',
          label: 'Send',
          isPinned: true,
          onClick: () => undefined,
        },
      ]),
    ).toEqual([
      expect.objectContaining({
        id: 'send',
        label: 'Send',
      }),
    ]);
  });

  it('keeps normal email composer footer items', () => {
    expect(
      filterVisibleSidePanelWidgetFooterCommandMenuItems([
        {
          id: 'reply',
          label: 'Reply',
          isPinned: true,
          onClick: () => undefined,
        },
      ]),
    ).toHaveLength(1);
  });
});
