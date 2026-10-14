import { isRecordTableColumnRendered } from '@/object-record/record-table/virtualization/utils/isRecordTableColumnRendered';

describe('isRecordTableColumnRendered', () => {
  const renderedColumnRange = { startColumnIndex: 3, endColumnIndex: 6 };

  it('always renders the first column', () => {
    expect(
      isRecordTableColumnRendered({
        columnIndex: 0,
        renderedColumnRange,
        focusedColumnIndexOutsideRange: null,
      }),
    ).toBe(true);
  });

  it('renders columns in the range and the focused column outside it', () => {
    expect(
      isRecordTableColumnRendered({
        columnIndex: 4,
        renderedColumnRange,
        focusedColumnIndexOutsideRange: null,
      }),
    ).toBe(true);
    expect(
      isRecordTableColumnRendered({
        columnIndex: 10,
        renderedColumnRange,
        focusedColumnIndexOutsideRange: 10,
      }),
    ).toBe(true);
  });

  it('does not render other columns', () => {
    expect(
      isRecordTableColumnRendered({
        columnIndex: 2,
        renderedColumnRange,
        focusedColumnIndexOutsideRange: 10,
      }),
    ).toBe(false);
  });
});
