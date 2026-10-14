import { RECORD_TABLE_COLUMN_CHECKBOX_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnCheckboxWidth';
import { RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH } from '@/object-record/record-table/constants/RecordTableColumnDragAndDropWidth';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useIsRecordTableCheckboxColumnHidden } from '@/object-record/record-table/hooks/useIsRecordTableCheckboxColumnHidden';
import { useRecordTableFirstColumnWidthOverride } from '@/object-record/record-table/hooks/useRecordTableFirstColumnWidthOverride';
import { isRecordTableDragColumnHiddenComponentState } from '@/object-record/record-table/states/isRecordTableDragColumnHiddenComponentState';
import { recordTableWidthComponentState } from '@/object-record/record-table/states/recordTableWidthComponentState';
import { resizedFieldMetadataIdComponentState } from '@/object-record/record-table/states/resizedFieldMetadataIdComponentState';
import { resizeFieldOffsetComponentState } from '@/object-record/record-table/states/resizeFieldOffsetComponentState';
import { computeRecordTableColumnOffsets } from '@/object-record/record-table/utils/computeRecordTableColumnOffsets';
import { RECORD_TABLE_COLUMN_VIRTUALIZATION_OVERSCAN_WIDTH } from '@/object-record/record-table/virtualization/constants/RecordTableColumnVirtualizationOverscanWidth';
import { recordTableRenderedColumnRangeComponentState } from '@/object-record/record-table/virtualization/states/recordTableRenderedColumnRangeComponentState';
import { computeRecordTableAllColumnsRange } from '@/object-record/record-table/virtualization/utils/computeRecordTableAllColumnsRange';
import { computeRecordTableColumnRange } from '@/object-record/record-table/virtualization/utils/computeRecordTableColumnRange';
import { isRecordTableColumnRangeIncluded } from '@/object-record/record-table/virtualization/utils/isRecordTableColumnRangeIncluded';
import { isSameRecordTableColumnRange } from '@/object-record/record-table/virtualization/utils/isSameRecordTableColumnRange';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { scrollWrapperScrollLeftComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollLeftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useStore } from 'jotai';
import { useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import { flushSync } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableColumnVirtualizationEffect = () => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  const recordTableWidth = useAtomComponentStateValue(
    recordTableWidthComponentState,
  );

  const resizedFieldMetadataId = useAtomComponentStateValue(
    resizedFieldMetadataIdComponentState,
  );

  const resizeFieldOffset = useAtomComponentStateValue(
    resizeFieldOffsetComponentState,
  );

  const firstColumnWidthOverride = useRecordTableFirstColumnWidthOverride();

  const isRecordTableDragColumnHidden = useAtomComponentStateValue(
    isRecordTableDragColumnHiddenComponentState,
  );

  const isRecordTableCheckboxColumnHidden =
    useIsRecordTableCheckboxColumnHidden();

  const renderedColumnRangeCallbackState = useAtomComponentStateCallbackState(
    recordTableRenderedColumnRangeComponentState,
  );

  const scrollWrapperScrollLeftCallbackState =
    useAtomComponentStateCallbackState(scrollWrapperScrollLeftComponentState);

  const store = useStore();

  const columnOffsets = useMemo(
    () =>
      computeRecordTableColumnOffsets({
        visibleRecordFields: visibleRecordFields.map((recordField) =>
          recordField.fieldMetadataItemId === resizedFieldMetadataId
            ? { size: recordField.size + resizeFieldOffset }
            : recordField,
        ),
        firstColumnWidthOverride,
      }),
    [
      visibleRecordFields,
      resizedFieldMetadataId,
      resizeFieldOffset,
      firstColumnWidthOverride,
    ],
  );

  const leftColumnsWidth =
    (isRecordTableDragColumnHidden
      ? 0
      : RECORD_TABLE_COLUMN_DRAG_AND_DROP_WIDTH) +
    (isRecordTableCheckboxColumnHidden
      ? 0
      : RECORD_TABLE_COLUMN_CHECKBOX_WIDTH);

  const updateRenderedColumnRange = useCallback(
    ({
      shouldKeepCurrentRangeIfSufficient,
    }: {
      shouldKeepCurrentRangeIfSufficient: boolean;
    }) => {
      const { scrollWrapperElement } = getScrollWrapperElement();

      if (!isDefined(scrollWrapperElement)) {
        return;
      }

      const currentColumnRange = store.get(renderedColumnRangeCallbackState);

      const viewportWidth = scrollWrapperElement.clientWidth;

      const scrollOffsetFromStart =
        getComputedStyle(scrollWrapperElement).direction === 'rtl'
          ? -scrollWrapperElement.scrollLeft
          : scrollWrapperElement.scrollLeft;

      const visibleStartOffset = scrollOffsetFromStart - leftColumnsWidth;

      const nextColumnRangeWithOverscan = (overscanWidth: number) =>
        computeRecordTableColumnRange({
          columnOffsets,
          visibleStartOffset: visibleStartOffset - overscanWidth,
          visibleEndOffset: visibleStartOffset + viewportWidth + overscanWidth,
        });

      if (
        shouldKeepCurrentRangeIfSufficient &&
        viewportWidth > 0 &&
        isDefined(currentColumnRange) &&
        isRecordTableColumnRangeIncluded({
          innerColumnRange: nextColumnRangeWithOverscan(
            RECORD_TABLE_COLUMN_VIRTUALIZATION_OVERSCAN_WIDTH / 2,
          ),
          outerColumnRange: currentColumnRange,
        })
      ) {
        return;
      }

      const nextColumnRange =
        viewportWidth === 0
          ? computeRecordTableAllColumnsRange(visibleRecordFields.length)
          : nextColumnRangeWithOverscan(
              RECORD_TABLE_COLUMN_VIRTUALIZATION_OVERSCAN_WIDTH,
            );

      if (!isSameRecordTableColumnRange(currentColumnRange, nextColumnRange)) {
        store.set(renderedColumnRangeCallbackState, nextColumnRange);
      }
    },
    [
      getScrollWrapperElement,
      store,
      renderedColumnRangeCallbackState,
      visibleRecordFields.length,
      leftColumnsWidth,
      columnOffsets,
    ],
  );

  useLayoutEffect(() => {
    updateRenderedColumnRange({ shouldKeepCurrentRangeIfSufficient: false });
  }, [updateRenderedColumnRange, recordTableWidth]);

  useEffect(
    () =>
      store.sub(scrollWrapperScrollLeftCallbackState, () => {
        updateRenderedColumnRange({ shouldKeepCurrentRangeIfSufficient: true });
      }),
    [store, scrollWrapperScrollLeftCallbackState, updateRenderedColumnRange],
  );

  useEffect(() => {
    const handleBeforePrint = () => {
      flushSync(() => {
        store.set(
          renderedColumnRangeCallbackState,
          computeRecordTableAllColumnsRange(visibleRecordFields.length),
        );
      });
    };

    const handleAfterPrint = () => {
      updateRenderedColumnRange({ shouldKeepCurrentRangeIfSufficient: false });
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [
    store,
    renderedColumnRangeCallbackState,
    visibleRecordFields.length,
    updateRenderedColumnRange,
  ]);

  return null;
};
