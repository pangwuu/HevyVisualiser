import React, { useState } from 'react';
import { Radar } from 'react-chartjs-2';
import { Card, Segmented, Typography } from 'antd';
import { Target } from 'lucide-react';
import './chartSetup';
import { MuscleGroup } from '../../types';

const { Text } = Typography;

interface MuscleRadarChartProps {
  muscleGroups: MuscleGroup[];
  setsData: number[];
  volumeData: number[];
  title?: string;
  height?: number;
}

export const MuscleRadarChart: React.FC<MuscleRadarChartProps> = ({
  muscleGroups,
  setsData,
  volumeData,
  title = 'Muscle Group Distribution',
  height = 320,
}) => {
  const [metric, setMetric] = useState<'sets' | 'volume'>('sets');

  const currentData = metric === 'sets' ? setsData : volumeData;
  const currentLabel = metric === 'sets' ? 'Total Sets' : 'Total Volume (kg)';

  const data = {
    labels: muscleGroups,
    datasets: [
      {
        label: currentLabel,
        data: currentData,
        backgroundColor: 'rgba(24, 144, 255, 0.25)',
        borderColor: '#1890ff',
        pointBackgroundColor: '#1890ff',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#1890ff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: '#303030',
        },
        grid: {
          color: '#303030',
        },
        pointLabels: {
          color: '#d9d9d9',
          font: {
            size: 13,
            weight: 600 as const,
          },
        },
        ticks: {
          color: '#8c8c8c',
          backdropColor: 'transparent',
          showLabelBackdrop: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw;
            return metric === 'sets' ? ` ${val} sets` : ` ${val.toLocaleString()} kg`;
          },
        },
      },
    },
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, color: '#fff' }}>
            <Target size={18} color="#1890ff" />
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
            style={{ backgroundColor: '#1f1f1f' }}
          />
        </div>
      }
      style={{ backgroundColor: '#141414', borderColor: '#303030' }}
    >
      <div style={{ height }}>
        <Radar data={data} options={options} />
      </div>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Compound exercises count toward all targeted muscle groups
        </Text>
      </div>
    </Card>
  );
};
