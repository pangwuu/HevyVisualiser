import React from 'react';
import { Line } from 'react-chartjs-2';
import { Card, Typography, Row, Col, Statistic, Empty, Alert } from 'antd';
import { AreaChartOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './chartSetup';
import { MeasurementRecord } from '../../types';

const { Text, Paragraph } = Typography;

interface MeasurementChartProps {
  measurements: MeasurementRecord[];
  height?: number;
}

export const MeasurementChart: React.FC<MeasurementChartProps> = ({
  measurements,
  height = 320,
}) => {
  const weightRecords = measurements.filter((m) => m.weightKg !== undefined);

  const initialWeight = weightRecords[0]?.weightKg;
  const currentWeight = weightRecords[weightRecords.length - 1]?.weightKg;
  const weightDiff = initialWeight !== undefined && currentWeight !== undefined ? currentWeight - initialWeight : 0;

  const chartData = {
    labels: weightRecords.map((m) => dayjs(m.date).format('D MMM YYYY')),
    datasets: [
      {
        label: 'Body Weight (kg)',
        data: weightRecords.map((m) => m.weightKg),
        borderColor: '#52c41a',
        backgroundColor: 'rgba(82, 196, 26, 0.15)',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 9,
        pointBackgroundColor: '#52c41a',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        fill: true,
        tension: 0.2,
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
          label: (context: any) => ` Weight: ${context.raw} kg`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#262626' },
        ticks: { color: '#8c8c8c' },
      },
      y: {
        grid: { color: '#262626' },
        ticks: { color: '#8c8c8c' },
        suggestedMin: initialWeight ? initialWeight - 5 : 50,
        suggestedMax: currentWeight ? currentWeight + 5 : 90,
      },
    },
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ backgroundColor: '#141414', borderColor: '#303030' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>Starting Weight</span>}
              value={initialWeight ?? '--'}
              suffix="kg"
              valueStyle={{ color: '#d9d9d9', fontSize: 24 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {weightRecords[0] ? dayjs(weightRecords[0].date).format('D MMM YYYY') : '--'}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ backgroundColor: '#141414', borderColor: '#303030' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>Current / Latest Weight</span>}
              value={currentWeight ?? '--'}
              suffix="kg"
              valueStyle={{ color: '#52c41a', fontSize: 24, fontWeight: 700 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {weightRecords[weightRecords.length - 1] ? dayjs(weightRecords[weightRecords.length - 1].date).format('D MMM YYYY') : '--'}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ backgroundColor: '#141414', borderColor: '#303030' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>Net Change</span>}
              value={Math.abs(weightDiff).toFixed(1)}
              prefix={weightDiff >= 0 ? <ArrowUpOutlined style={{ color: '#52c41a' }} /> : <ArrowDownOutlined style={{ color: '#1890ff' }} />}
              suffix="kg"
              valueStyle={{ color: weightDiff >= 0 ? '#52c41a' : '#1890ff', fontSize: 24, fontWeight: 700 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Across {weightRecords.length} logged data points
            </Text>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AreaChartOutlined style={{ color: '#52c41a' }} />
            Body Weight Trend
          </span>
        }
        style={{ backgroundColor: '#141414', borderColor: '#303030', marginBottom: 16 }}
      >
        {weightRecords.length > 0 ? (
          <div style={{ height }}>
            <Line data={chartData} options={options} />
          </div>
        ) : (
          <Empty description="No body weight entries found in measurement data" />
        )}
      </Card>

      <Alert
        message="Tracking Body Composition in Hevy"
        description={
          <Paragraph style={{ margin: 0, color: '#bfbfbf' }}>
            You currently have {weightRecords.length} body weight entries logged. Other measurement metrics (body fat %, chest, arms, waist, thighs) will automatically populate and chart here as you log them inside the Hevy app under the <strong>Measurements</strong> tab.
          </Paragraph>
        }
        type="info"
        showIcon
        style={{ backgroundColor: '#111b26', borderColor: '#153450' }}
      />
    </div>
  );
};
