import { type RecordTableColumnRange } from '@/object-record/record-table/virtualization/types/RecordTableColumnRange';
import { type RecordTableColumnVirtualizationItem } from '@/object-record/record-table/virtualization/types/RecordTableColumnVirtualizationItem';
import { isRecordTableColumnRendered } from '@/object-record/record-table/virtualization/utils/isRecordTableColumnRendered';
import { isDefined } from 'twenty-shared/utils';

export const computeRecordTableColumnVirtualizationItems = ({
  columnOffsets,
  renderedColumnRange,
  focusedColumnIndexOutsideRange,
}: {
  columnOffsets: number[];
  renderedColumnRange: RecordTableColumnRange | null;
  focusedColumnIndexOutsideRange: number | null;
}): RecordTableColumnVirtualizationItem[] => {
  const lastColumnIndex = columnOffsets.length - 2;

  const items: RecordTableColumnVirtualizationItem[] = [];

  let spacerFirstColumnIndex: number | null = null;

  const pushSpacerEndingBefore = (columnIndex: number) => {
    if (!isDefined(spacerFirstColumnIndex)) {
      return;
    }

    items.push({
      type: 'spacer',
      firstColumnIndex: spacerFirstColumnIndex,
      width: columnOffsets[columnIndex] - columnOffsets[spacerFirstColumnIndex],
    });

    spacerFirstColumnIndex = null;
  };

  for (let columnIndex = 1; columnIndex <= lastColumnIndex; columnIndex++) {
    if (
      isRecordTableColumnRendered({
        columnIndex,
        renderedColumnRange,
        focusedColumnIndexOutsideRange,
      })
    ) {
      pushSpacerEndingBefore(columnIndex);
      items.push({ type: 'column', columnIndex });
    } else if (!isDefined(spacerFirstColumnIndex)) {
      spacerFirstColumnIndex = columnIndex;
    }
  }

  pushSpacerEndingBefore(lastColumnIndex + 1);

  return items;
};
