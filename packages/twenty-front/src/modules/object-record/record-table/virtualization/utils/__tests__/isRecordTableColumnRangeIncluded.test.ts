import { isRecordTableColumnRangeIncluded } from '@/object-record/record-table/virtualization/utils/isRecordTableColumnRangeIncluded';

describe('isRecordTableColumnRangeIncluded', () => {
  it('accepts a range inside another one', () => {
    expect(
      isRecordTableColumnRangeIncluded({
        innerColumnRange: { startColumnIndex: 3, endColumnIndex: 5 },
        outerColumnRange: { startColumnIndex: 2, endColumnIndex: 5 },
      }),
    ).toBe(true);
  });

  it('rejects a range overflowing on either side', () => {
    expect(
      isRecordTableColumnRangeIncluded({
        innerColumnRange: { startColumnIndex: 1, endColumnIndex: 4 },
        outerColumnRange: { startColumnIndex: 2, endColumnIndex: 5 },
      }),
    ).toBe(false);
    expect(
      isRecordTableColumnRangeIncluded({
        innerColumnRange: { startColumnIndex: 3, endColumnIndex: 6 },
        outerColumnRange: { startColumnIndex: 2, endColumnIndex: 5 },
      }),
    ).toBe(false);
  });
});
