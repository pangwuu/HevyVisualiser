import React from 'react';
import { Space, Segmented, Switch, DatePicker, Typography } from 'antd';
import { FilterOutlined, CalendarOutlined, FireOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useWorkoutData } from '../../hooks/useWorkoutData';
import { TimeRangeOption } from '../../types';

const { Text } = Typography;
const { RangePicker } = DatePicker;

export const TimeFilterBar: React.FC = () => {
  const { filter, setTimeRange, setIncludeWarmups, filteredSessions } = useWorkoutData();

  const handleRangeChange = (val: TimeRangeOption) => {
    setTimeRange(val);
  };

  const handleCustomDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setTimeRange('custom', dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD'));
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        padding: '12px 16px',
        backgroundColor: '#1f1f1f',
        borderRadius: 8,
        border: '1px solid #303030',
        marginBottom: 20,
      }}
    >
      <Space size="middle" wrap align="center">
        <Space size="small">
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <Text strong style={{ color: '#d9d9d9' }}>Time Period:</Text>
        </Space>
        <Segmented
          value={filter.timeRange}
          onChange={(val) => handleRangeChange(val as TimeRangeOption)}
          options={[
            { label: '7 Days', value: '7d' },
            { label: '30 Days', value: '30d' },
            { label: '3 Months', value: '3m' },
            { label: '1 Year', value: '1y' },
            { label: 'All Time', value: 'all' },
            { label: 'Custom', value: 'custom' },
          ]}
        />
        {filter.timeRange === 'custom' && (
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
      </Space>

      <Space size="large" wrap align="center">
        <Space size="small">
          <Switch
            checked={filter.includeWarmups}
            onChange={setIncludeWarmups}
            size="small"
          />
          <Text style={{ color: '#bfbfbf', fontSize: 13 }}>
            <FireOutlined style={{ color: filter.includeWarmups ? '#fa8c16' : '#8c8c8c', marginRight: 4 }} />
            Include Warmup Sets
          </Text>
        </Space>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <FilterOutlined style={{ marginRight: 4 }} />
          {filteredSessions.length} sessions in view
        </Text>
      </Space>
    </div>
  );
};
