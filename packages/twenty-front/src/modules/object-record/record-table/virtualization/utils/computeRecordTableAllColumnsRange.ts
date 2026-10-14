import { type RecordTableColumnRange } from '@/object-record/record-table/virtualization/types/RecordTableColumnRange';

export const computeRecordTableAllColumnsRange = (
  columnCount: number,
): RecordTableColumnRange => ({
  startColumnIndex: 1,
  endColumnIndex: columnCount - 1,
});
