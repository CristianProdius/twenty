import { type ReactNode, useMemo } from 'react';

import { RecordTableColumnVirtualizationItemsContextValueProvider } from '@/object-record/record-table/contexts/RecordTableColumnVirtualizationItemsContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { computeRecordTableColumnOffsets } from '@/object-record/record-table/utils/computeRecordTableColumnOffsets';
import { recordTableFocusedColumnIndexOutsideRangeComponentSelector } from '@/object-record/record-table/virtualization/states/recordTableFocusedColumnIndexOutsideRangeComponentSelector';
import { recordTableRenderedColumnRangeComponentState } from '@/object-record/record-table/virtualization/states/recordTableRenderedColumnRangeComponentState';
import { computeRecordTableColumnVirtualizationItems } from '@/object-record/record-table/virtualization/utils/computeRecordTableColumnVirtualizationItems';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const RecordTableColumnVirtualizationItemsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const renderedColumnRange = useAtomComponentStateValue(
    recordTableRenderedColumnRangeComponentState,
  );

  const focusedColumnIndexOutsideRange = useAtomComponentSelectorValue(
    recordTableFocusedColumnIndexOutsideRangeComponentSelector,
  );

  const columnVirtualizationItems = useMemo(
    () =>
      computeRecordTableColumnVirtualizationItems({
        columnOffsets: computeRecordTableColumnOffsets({ visibleRecordFields }),
        renderedColumnRange,
        focusedColumnIndexOutsideRange,
      }),
    [visibleRecordFields, renderedColumnRange, focusedColumnIndexOutsideRange],
  );

  return (
    <RecordTableColumnVirtualizationItemsContextValueProvider
      value={columnVirtualizationItems}
    >
      {children}
    </RecordTableColumnVirtualizationItemsContextValueProvider>
  );
};
