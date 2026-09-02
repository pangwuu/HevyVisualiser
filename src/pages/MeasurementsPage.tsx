import React from 'react';
import { Card, Typography, Table } from 'antd';
import dayjs from 'dayjs';
import { useWorkoutData } from '../hooks/useWorkoutData';
import { MeasurementChart } from '../components/Charts/MeasurementChart';
import { MeasurementRecord } from '../types';

const { Title, Text } = Typography;

export const MeasurementsPage: React.FC = () => {
  const { measurements } = useWorkoutData();

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (d: Date) => dayjs(d).format('ddd, D MMM YYYY'),
    },
    {
      title: 'Body Weight (kg)',
      dataIndex: 'weightKg',
      key: 'weightKg',
      render: (w?: number) => (w ? <span style={{ color: '#52c41a', fontWeight: 600 }}>{w} kg</span> : '--'),
    },
    {
      title: 'Body Fat (%)',
      dataIndex: 'fatPercent',
      key: 'fatPercent',
      render: (f?: number) => (f ? `${f}%` : '--'),
    },
    {
      title: 'Chest (cm)',
      dataIndex: 'chestCm',
      key: 'chestCm',
      render: (c?: number) => (c ? `${c} cm` : '--'),
    },
    {
      title: 'Waist (cm)',
      dataIndex: 'waistCm',
      key: 'waistCm',
      render: (w?: number) => (w ? `${w} cm` : '--'),
    },
    {
      title: 'Biceps (cm)',
      key: 'biceps',
      render: (_: any, r: MeasurementRecord) => {
        if (r.leftBicepCm || r.rightBicepCm) {
          return `L: ${r.leftBicepCm || '--'} | R: ${r.rightBicepCm || '--'}`;
        }
        return '--';
      },
    },
    {
      title: 'Thighs (cm)',
      key: 'thighs',
      render: (_: any, r: MeasurementRecord) => {
        if (r.leftThighCm || r.rightThighCm) {
          return `L: ${r.leftThighCm || '--'} | R: ${r.rightThighCm || '--'}`;
        }
        return '--';
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ color: '#fff', margin: 0 }}>
          📏 Body Measurements & Weight Tracker
        </Title>
        <Text type="secondary">
          Log and observe body composition changes, scale weight, and circumference trends.
        </Text>
      </div>

      <div style={{ marginBottom: 24 }}>
        <MeasurementChart measurements={measurements} />
      </div>

      <Card
        title={<span style={{ color: '#fff' }}>Measurement History Log</span>}
        style={{ backgroundColor: '#141414', borderColor: '#303030' }}
      >
        <Table
          dataSource={[...measurements].reverse()}
          columns={columns}
          rowKey="dateStr"
          pagination={false}
          scroll={{ x: 700 }}
        />
      </Card>
    </div>
  );
};
