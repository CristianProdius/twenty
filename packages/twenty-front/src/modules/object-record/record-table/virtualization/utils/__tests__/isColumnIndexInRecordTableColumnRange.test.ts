import { isColumnIndexInRecordTableColumnRange } from '@/object-record/record-table/virtualization/utils/isColumnIndexInRecordTableColumnRange';

describe('isColumnIndexInRecordTableColumnRange', () => {
  const columnRange = { startColumnIndex: 2, endColumnIndex: 5 };

  it('accepts column indexes inside the range, bounds included', () => {
    expect(
      isColumnIndexInRecordTableColumnRange({ columnIndex: 2, columnRange }),
    ).toBe(true);
    expect(
      isColumnIndexInRecordTableColumnRange({ columnIndex: 5, columnRange }),
    ).toBe(true);
  });

  it('rejects column indexes outside the range or without a range', () => {
    expect(
      isColumnIndexInRecordTableColumnRange({ columnIndex: 1, columnRange }),
    ).toBe(false);
    expect(
      isColumnIndexInRecordTableColumnRange({ columnIndex: 6, columnRange }),
    ).toBe(false);
    expect(
      isColumnIndexInRecordTableColumnRange({
        columnIndex: 3,
        columnRange: null,
      }),
    ).toBe(false);
  });
});
