import { type RecordTableColumnRange } from '@/object-record/record-table/virtualization/types/RecordTableColumnRange';
import { isDefined } from 'twenty-shared/utils';

export const isColumnIndexInRecordTableColumnRange = ({
  columnIndex,
  columnRange,
}: {
  columnIndex: number;
  columnRange: RecordTableColumnRange | null;
}) =>
  isDefined(columnRange) &&
  columnIndex >= columnRange.startColumnIndex &&
  columnIndex <= columnRange.endColumnIndex;
