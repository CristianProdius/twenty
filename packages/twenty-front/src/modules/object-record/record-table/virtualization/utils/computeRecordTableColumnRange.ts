import { type RecordTableColumnRange } from '@/object-record/record-table/virtualization/types/RecordTableColumnRange';

export const computeRecordTableColumnRange = ({
  columnOffsets,
  visibleStartOffset,
  visibleEndOffset,
}: {
  columnOffsets: number[];
  visibleStartOffset: number;
  visibleEndOffset: number;
}): RecordTableColumnRange => {
  const lastColumnIndex = columnOffsets.length - 2;

  if (lastColumnIndex < 1) {
    return { startColumnIndex: 1, endColumnIndex: 0 };
  }

  let startColumnIndex = 1;

  while (
    startColumnIndex < lastColumnIndex &&
    columnOffsets[startColumnIndex + 1] <= visibleStartOffset
  ) {
    startColumnIndex++;
  }

  let endColumnIndex = startColumnIndex;

  while (
    endColumnIndex < lastColumnIndex &&
    columnOffsets[endColumnIndex + 1] < visibleEndOffset
  ) {
    endColumnIndex++;
  }

  return { startColumnIndex, endColumnIndex };
};
