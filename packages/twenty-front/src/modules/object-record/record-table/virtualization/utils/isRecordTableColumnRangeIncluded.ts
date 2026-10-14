import { type RecordTableColumnRange } from '@/object-record/record-table/virtualization/types/RecordTableColumnRange';

export const isRecordTableColumnRangeIncluded = ({
  innerColumnRange,
  outerColumnRange,
}: {
  innerColumnRange: RecordTableColumnRange;
  outerColumnRange: RecordTableColumnRange;
}) =>
  innerColumnRange.startColumnIndex >= outerColumnRange.startColumnIndex &&
  innerColumnRange.endColumnIndex <= outerColumnRange.endColumnIndex;
