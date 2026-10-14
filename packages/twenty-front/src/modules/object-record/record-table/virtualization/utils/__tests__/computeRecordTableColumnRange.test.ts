import { computeRecordTableColumnOffsets } from '@/object-record/record-table/utils/computeRecordTableColumnOffsets';
import { computeRecordTableColumnRange } from '@/object-record/record-table/virtualization/utils/computeRecordTableColumnRange';

const columnOffsets = computeRecordTableColumnOffsets({
  visibleRecordFields: Array.from({ length: 10 }, () => ({ size: 100 })),
});

describe('computeRecordTableColumnRange', () => {
  it('keeps the columns overlapping the visible window', () => {
    expect(
      computeRecordTableColumnRange({
        columnOffsets,
        visibleStartOffset: 250,
        visibleEndOffset: 550,
      }),
    ).toEqual({ startColumnIndex: 2, endColumnIndex: 5 });
  });

  it('never starts before the first scrollable column', () => {
    expect(
      computeRecordTableColumnRange({
        columnOffsets,
        visibleStartOffset: -500,
        visibleEndOffset: 150,
      }),
    ).toEqual({ startColumnIndex: 1, endColumnIndex: 1 });
  });

  it('keeps the last column when scrolled past the end', () => {
    expect(
      computeRecordTableColumnRange({
        columnOffsets,
        visibleStartOffset: 5000,
        visibleEndOffset: 6000,
      }),
    ).toEqual({ startColumnIndex: 9, endColumnIndex: 9 });
  });

  it('returns an empty range when only the first column exists', () => {
    expect(
      computeRecordTableColumnRange({
        columnOffsets: computeRecordTableColumnOffsets({
          visibleRecordFields: [{ size: 100 }],
        }),
        visibleStartOffset: 0,
        visibleEndOffset: 1000,
      }),
    ).toEqual({ startColumnIndex: 1, endColumnIndex: 0 });
  });
});
