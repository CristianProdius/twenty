import { type RecordTableColumnRange } from '@/object-record/record-table/virtualization/types/RecordTableColumnRange';
import { isDefined } from 'twenty-shared/utils';

export const isSameRecordTableColumnRange = (
  columnRange: RecordTableColumnRange | null,
  otherColumnRange: RecordTableColumnRange,
) =>
  isDefined(columnRange) &&
  columnRange.startColumnIndex === otherColumnRange.startColumnIndex &&
  columnRange.endColumnIndex === otherColumnRange.endColumnIndex;
