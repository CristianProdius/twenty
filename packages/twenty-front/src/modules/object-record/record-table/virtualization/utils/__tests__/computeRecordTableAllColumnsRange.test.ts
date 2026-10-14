import { computeRecordTableAllColumnsRange } from '@/object-record/record-table/virtualization/utils/computeRecordTableAllColumnsRange';

describe('computeRecordTableAllColumnsRange', () => {
  it('covers every column after the label identifier', () => {
    expect(computeRecordTableAllColumnsRange(5)).toEqual({
      startColumnIndex: 1,
      endColumnIndex: 4,
    });
  });
});
