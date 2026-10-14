import { useRecordTableColumnVirtualizationItemsContextOrThrow } from '@/object-record/record-table/contexts/RecordTableColumnVirtualizationItemsContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { computeRecordTableColumnOffsets } from '@/object-record/record-table/utils/computeRecordTableColumnOffsets';
import { computeRecordTableAllColumnsRange } from '@/object-record/record-table/virtualization/utils/computeRecordTableAllColumnsRange';
import { computeRecordTableColumnVirtualizationItems } from '@/object-record/record-table/virtualization/utils/computeRecordTableColumnVirtualizationItems';
import { useMemo } from 'react';

export const useRecordTableColumnVirtualizationItems = ({
  shouldRenderAllColumns = false,
}: {
  shouldRenderAllColumns?: boolean;
} = {}) => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const columnVirtualizationItems =
    useRecordTableColumnVirtualizationItemsContextOrThrow();

  const allColumnVirtualizationItems = useMemo(
    () =>
      shouldRenderAllColumns
        ? computeRecordTableColumnVirtualizationItems({
            columnOffsets: computeRecordTableColumnOffsets({
              visibleRecordFields,
            }),
            renderedColumnRange: computeRecordTableAllColumnsRange(
              visibleRecordFields.length,
            ),
            focusedColumnIndexOutsideRange: null,
          })
        : null,
    [shouldRenderAllColumns, visibleRecordFields],
  );

  return allColumnVirtualizationItems ?? columnVirtualizationItems;
};
