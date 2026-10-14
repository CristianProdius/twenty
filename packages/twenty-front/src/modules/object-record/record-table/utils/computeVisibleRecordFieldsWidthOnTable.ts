import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { computeRecordTableColumnOffsets } from '@/object-record/record-table/utils/computeRecordTableColumnOffsets';

export const computeVisibleRecordFieldsWidthOnTable = ({
  firstColumnWidthOverride,
  visibleRecordFields,
}: {
  firstColumnWidthOverride?: number;
  visibleRecordFields: Pick<RecordField, 'size'>[];
}) => {
  const columnOffsets = computeRecordTableColumnOffsets({
    visibleRecordFields,
    firstColumnWidthOverride,
  });

  return {
    visibleRecordFieldsWidth: columnOffsets[columnOffsets.length - 1],
  };
};
