import { type RecordTableColumnRange } from '@/object-record/record-table/virtualization/types/RecordTableColumnRange';
import { isColumnIndexInRecordTableColumnRange } from '@/object-record/record-table/virtualization/utils/isColumnIndexInRecordTableColumnRange';

export const isRecordTableColumnRendered = ({
  columnIndex,
  renderedColumnRange,
  focusedColumnIndexOutsideRange,
}: {
  columnIndex: number;
  renderedColumnRange: RecordTableColumnRange | null;
  focusedColumnIndexOutsideRange: number | null;
}) =>
  columnIndex === 0 ||
  columnIndex === focusedColumnIndexOutsideRange ||
  isColumnIndexInRecordTableColumnRange({
    columnIndex,
    columnRange: renderedColumnRange,
  });
