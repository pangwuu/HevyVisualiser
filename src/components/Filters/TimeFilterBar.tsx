import React from 'react';
import { Space, Segmented, Switch, DatePicker, Typography, Grid, Alert, Button, Tag } from 'antd';
import { Calendar, Flame, Filter, AlertCircle, RotateCcw } from 'lucide-react';
import dayjs, { Dayjs } from 'dayjs';
import { useWorkoutData } from '../../hooks/useWorkoutData';
import { TimeRangeOption } from '../../types';

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

export const TimeFilterBar: React.FC = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md; // mobile when below md (768px)
  const { filter, setTimeRange, setIncludeWarmups, filteredSessions, allSessions } = useWorkoutData();

  const handleRangeChange = (val: TimeRangeOption) => {
    setTimeRange(val);
  };

  const handleCustomDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setTimeRange('custom', dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD'));
    }
  };

  const segmentedOptions = isMobile
    ? [
        { label: '7D', value: '7d' },
        { label: '30D', value: '30d' },
        { label: '3M', value: '3m' },
        { label: '1Y', value: '1y' },
        { label: 'All', value: 'all' },
      ]
    : [
        { label: '7 Days', value: '7d' },
        { label: '30 Days', value: '30d' },
        { label: '3 Months', value: '3m' },
        { label: '1 Year', value: '1y' },
        { label: 'All Time', value: 'all' },
        { label: 'Custom', value: 'custom' },
      ];

  const hasNoDataInRange = allSessions.length > 0 && filteredSessions.length === 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: isMobile ? '12px' : '12px 16px',
        backgroundColor: '#1f1f1f',
        borderRadius: 8,
        border: hasNoDataInRange ? '1px solid rgba(250, 173, 20, 0.4)' : '1px solid #303030',
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        {/* Time range selection */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: 10,
            flex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 'max-content' }}>
            <Calendar size={16} color="#1890ff" />
            <Text strong style={{ color: '#d9d9d9', fontSize: 13 }}>
              Time Period:
            </Text>
          </div>

          <Segmented
            block={isMobile}
            size="middle"
            value={isMobile && filter.timeRange === 'custom' ? 'all' : filter.timeRange}
            onChange={(val) => handleRangeChange(val as TimeRangeOption)}
            options={segmentedOptions}
            style={{ backgroundColor: '#141414' }}
          />

          {!isMobile && filter.timeRange === 'custom' && (
            <RangePicker
              value={
                filter.customStartDate && filter.customEndDate
                  ? [dayjs(filter.customStartDate), dayjs(filter.customEndDate)]
                  : null
              }
              onChange={handleCustomDateChange}
              format="YYYY-MM-DD"
              style={{ backgroundColor: '#141414' }}
            />
          )}
        </div>

        {/* Warmups switch & sessions count badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
            flexWrap: 'wrap',
            gap: 12,
            paddingTop: isMobile ? 8 : 0,
            borderTop: isMobile ? '1px solid #2a2a2a' : 'none',
          }}
        >
          <Space size="small">
            <Switch
              checked={filter.includeWarmups}
              onChange={setIncludeWarmups}
              size="small"
            />
            <Text style={{ color: '#bfbfbf', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Flame size={14} color={filter.includeWarmups ? '#fa8c16' : '#8c8c8c'} />
              Warmup Sets
            </Text>
          </Space>

          {hasNoDataInRange ? (
            <Tag color="warning" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4, margin: 0 }}>
              <AlertCircle size={13} />
              0 sessions in range
            </Tag>
          ) : (
            <Text type="secondary" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Filter size={13} />
              {filteredSessions.length} sessions
            </Text>
          )}
        </div>
      </div>

      {/* Warning Alert when no sessions fall within custom/selected range */}
      {hasNoDataInRange && (
        <Alert
          message={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <strong style={{ color: '#faad14', fontSize: 13 }}>
                  No workouts recorded in this time range
                </strong>
                <div style={{ color: '#d9d9d9', fontSize: 12, marginTop: 2 }}>
                  {filter.timeRange === 'custom' && filter.customStartDate && filter.customEndDate
                    ? `No workouts were logged between ${dayjs(filter.customStartDate).format('D MMM YYYY')} and ${dayjs(filter.customEndDate).format('D MMM YYYY')}. All ${allSessions.length} total workouts remain preserved in your storage.`
                    : `No workouts fall inside the selected ${filter.timeRange.toUpperCase()} window. All ${allSessions.length} total workouts remain preserved in your storage.`}
                </div>
              </div>
              <Button
                size="small"
                type="primary"
                icon={<RotateCcw size={13} />}
                onClick={() => setTimeRange('all')}
                style={{ backgroundColor: '#faad14', borderColor: '#d48806', color: '#000', fontWeight: 600 }}
              >
                Reset to All Time
              </Button>
            </div>
          }
          type="warning"
          showIcon
          icon={<AlertCircle size={18} color="#faad14" />}
          style={{
            backgroundColor: 'rgba(250, 173, 20, 0.1)',
            borderColor: 'rgba(250, 173, 20, 0.3)',
            borderRadius: 6,
          }}
        />
      )}
    </div>
  );
};
