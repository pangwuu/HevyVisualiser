import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, Typography } from 'antd';
import { RiseOutlined } from '@ant-design/icons';
import './chartSetup';

const { Text } = Typography;

interface VolumeTrendChartProps {
  weeks: string[];
  volumes: number[];
  workoutsCount: number[];
  title?: string;
  height?: number;
}

export const VolumeTrendChart: React.FC<VolumeTrendChartProps> = ({
  weeks,
  volumes,
  workoutsCount,
  title = 'Weekly Volume Trend',
  height = 320,
}) => {
  const chartData = {
    labels: weeks,
    datasets: [
      {
        type: 'bar' as const,
        label: 'Weekly Volume (kg)',
        data: volumes,
        backgroundColor: 'rgba(24, 144, 255, 0.65)',
        borderColor: '#1890ff',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Workouts / Week',
        data: workoutsCount,
        borderColor: '#52c41a',
        backgroundColor: '#52c41a',
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        labels: {
          color: '#d9d9d9',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            if (context.dataset.yAxisID === 'y') {
              return ` Volume: ${context.raw.toLocaleString()} kg`;
            }
            return ` Workouts: ${context.raw}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#262626' },
        ticks: {
          color: '#8c8c8c',
          maxTicksLimit: 12,
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        grid: { color: '#262626' },
        ticks: {
          color: '#8c8c8c',
          callback: (val: any) => `${(val / 1000).toFixed(0)}k`,
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        ticks: {
          color: '#52c41a',
          stepSize: 1,
        },
      },
    },
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <RiseOutlined style={{ color: '#1890ff' }} />
            {title}
          </span>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {weeks.length} weeks tracked
          </Text>
        </div>
      }
      style={{ backgroundColor: '#141414', borderColor: '#303030' }}
    >
      <div style={{ height }}>
        <Bar data={chartData as any} options={options as any} />
      </div>
    </Card>
  );
};
