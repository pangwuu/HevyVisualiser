import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, Segmented, Row, Col, Progress, Typography } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import './chartSetup';
import { MuscleGroup } from '../../types';

const { Text } = Typography;

interface MuscleBarChartProps {
  muscleGroups: MuscleGroup[];
  setsData: number[];
  volumeData: number[];
  title?: string;
}

const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  Back: '#1890ff',
  Legs: '#52c41a',
  Chest: '#fa8c16',
  Arms: '#eb2f96',
  Shoulders: '#722ed1',
  Core: '#13c2c2',
};

export const MuscleBarChart: React.FC<MuscleBarChartProps> = ({
  muscleGroups,
  setsData,
  volumeData,
  title = 'Muscle Group Volume & Sets Breakdown',
}) => {
  const [metric, setMetric] = useState<'sets' | 'volume'>('sets');

  const currentData = metric === 'sets' ? setsData : volumeData;
  const total = currentData.reduce((a, b) => a + b, 0);

  const backgroundColors = muscleGroups.map((mg) => MUSCLE_COLORS[mg] || '#1890ff');

  const chartData = {
    labels: muscleGroups,
    datasets: [
      {
        label: metric === 'sets' ? 'Sets' : 'Volume (kg)',
        data: currentData,
        backgroundColor: backgroundColors.map((c) => `${c}cc`),
        borderColor: backgroundColors,
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
            return metric === 'sets'
              ? ` ${val} sets (${pct}%)`
              : ` ${val.toLocaleString()} kg (${pct}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#262626' },
        ticks: { color: '#d9d9d9', font: { weight: 600 as const } },
      },
      y: {
        grid: { color: '#262626' },
        ticks: { color: '#8c8c8c' },
      },
    },
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChartOutlined style={{ color: '#fa8c16' }} />
            {title}
          </span>
          <Segmented
            size="small"
            value={metric}
            onChange={(val) => setMetric(val as 'sets' | 'volume')}
            options={[
              { label: 'Set Count', value: 'sets' },
              { label: 'Volume (kg)', value: 'volume' },
            ]}
          />
        </div>
      }
      style={{ backgroundColor: '#141414', borderColor: '#303030' }}
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <div style={{ height: 280 }}>
            <Bar data={chartData} options={options} />
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', height: '100%' }}>
            {muscleGroups.map((mg, idx) => {
              const val = currentData[idx] || 0;
              const pct = total > 0 ? Math.round((val / total) * 100) : 0;
              const color = MUSCLE_COLORS[mg] || '#1890ff';

              return (
                <div key={mg}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text strong style={{ color }}>{mg}</Text>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {metric === 'sets' ? `${val} sets` : `${val.toLocaleString()} kg`} ({pct}%)
                    </Text>
                  </div>
                  <Progress
                    percent={pct}
                    strokeColor={color}
                    trailColor="#262626"
                    showInfo={false}
                    size="small"
                  />
                </div>
              );
            })}
          </div>
        </Col>
      </Row>
    </Card>
  );
};
