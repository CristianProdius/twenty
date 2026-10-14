import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableCellLoading } from '@/object-record/record-table/record-table-cell/components/RecordTableCellLoading';
import { RecordTableColumnSpacer } from '@/object-record/record-table/virtualization/components/RecordTableColumnSpacer';
import { useRecordTableColumnVirtualizationItems } from '@/object-record/record-table/virtualization/hooks/useRecordTableColumnVirtualizationItems';
import { isNonEmptyArray } from 'twenty-shared/utils';

type RecordTableFieldsCellsLoadingProps = {
  isSelected?: boolean;
};

export const RecordTableFieldsCellsLoading = ({
  isSelected,
}: RecordTableFieldsCellsLoadingProps) => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const columnVirtualizationItems = useRecordTableColumnVirtualizationItems();

  if (!isNonEmptyArray(visibleRecordFields)) {
    return null;
  }

  return (
    <>
      <RecordTableCellLoading recordFieldIndex={0} isSelected={isSelected} />
      {columnVirtualizationItems.map((columnVirtualizationItem) =>
        columnVirtualizationItem.type === 'spacer' ? (
          <RecordTableColumnSpacer
            key={`spacer-${columnVirtualizationItem.firstColumnIndex}`}
            width={columnVirtualizationItem.width}
            hasBottomBorder
          />
        ) : (
          <RecordTableCellLoading
            key={
              visibleRecordFields[columnVirtualizationItem.columnIndex]
                .fieldMetadataItemId
            }
            recordFieldIndex={columnVirtualizationItem.columnIndex}
            isSelected={isSelected}
          />
        ),
      )}
    </>
  );
};
