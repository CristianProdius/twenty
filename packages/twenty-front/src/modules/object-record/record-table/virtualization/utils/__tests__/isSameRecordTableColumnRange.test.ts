import { isSameRecordTableColumnRange } from '@/object-record/record-table/virtualization/utils/isSameRecordTableColumnRange';

describe('isSameRecordTableColumnRange', () => {
  it('compares bounds and treats a missing range as different', () => {
    const columnRange = { startColumnIndex: 2, endColumnIndex: 5 };

    expect(
      isSameRecordTableColumnRange(columnRange, {
        startColumnIndex: 2,
        endColumnIndex: 5,
      }),
    ).toBe(true);
    expect(
      isSameRecordTableColumnRange(columnRange, {
        startColumnIndex: 2,
        endColumnIndex: 6,
      }),
    ).toBe(false);
    expect(isSameRecordTableColumnRange(null, columnRange)).toBe(false);
  });
});
