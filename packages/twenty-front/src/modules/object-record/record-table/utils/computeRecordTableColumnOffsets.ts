import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { isDefined } from 'twenty-shared/utils';

export const computeRecordTableColumnOffsets = ({
  visibleRecordFields,
  firstColumnWidthOverride,
}: {
  visibleRecordFields: Pick<RecordField, 'size'>[];
  firstColumnWidthOverride?: number;
}): number[] => {
  const columnOffsets = [0];

  for (const [index, recordField] of visibleRecordFields.entries()) {
    const columnWidth =
      index === 0 && isDefined(firstColumnWidthOverride)
        ? firstColumnWidthOverride
        : recordField.size;

    columnOffsets.push(columnOffsets[index] + columnWidth);
  }

  return columnOffsets;
};
