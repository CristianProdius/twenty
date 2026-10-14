import { isColumnIndexInRecordTableColumnRange } from '@/object-record/record-table/virtualization/utils/isColumnIndexInRecordTableColumnRange';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { recordTableRenderedColumnRangeComponentState } from '@/object-record/record-table/virtualization/states/recordTableRenderedColumnRangeComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { isDefined } from 'twenty-shared/utils';

export const recordTableFocusedColumnIndexOutsideRangeComponentSelector =
  createAtomComponentSelector<number | null>({
    key: 'recordTableFocusedColumnIndexOutsideRangeComponentSelector',
    componentInstanceContext: RecordTableComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const focusPosition = get(recordTableFocusPositionComponentState, {
          instanceId,
        });

        const renderedColumnRange = get(
          recordTableRenderedColumnRangeComponentState,
          { instanceId },
        );

        if (!isDefined(focusPosition) || focusPosition.column < 1) {
          return null;
        }

        const isFocusedColumnInRenderedRange =
          isColumnIndexInRecordTableColumnRange({
            columnIndex: focusPosition.column,
            columnRange: renderedColumnRange,
          });

        return isFocusedColumnInRenderedRange ? null : focusPosition.column;
      },
  });
