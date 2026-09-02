import React, { useMemo } from 'react';
import { Row, Col, Card, Typography, Tag, Progress, Space, Alert } from 'antd';
import { DotChartOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useWorkoutData } from '../hooks/useWorkoutData';
import { TimeFilterBar } from '../components/Filters/TimeFilterBar';
import { MuscleRadarChart } from '../components/Charts/MuscleRadarChart';
import { MuscleBarChart } from '../components/Charts/MuscleBarChart';
import { MUSCLE_GROUPS } from '../data/exerciseMapping';
import { MuscleGroup, WorkoutSet } from '../types';

const { Title, Text } = Typography;

const MUSCLE_ICONS: Record<MuscleGroup, string> = {
  Back: '🦅',
  Legs: '🦵',
  Chest: '🛡️',
  Arms: '💪',
  Shoulders: '🎯',
  Core: '🧱',
};

const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  Back: '#1890ff',
  Legs: '#52c41a',
  Chest: '#fa8c16',
  Arms: '#eb2f96',
  Shoulders: '#722ed1',
  Core: '#13c2c2',
};

export const MusclesPage: React.FC = () => {
  const { muscleDistribution, filteredSets } = useWorkoutData();

  const totalSetsAcrossMuscles = muscleDistribution.setsData.reduce((a: number, b: number) => a + b, 0);
  const totalVolumeAcrossMuscles = muscleDistribution.volumeData.reduce((a: number, b: number) => a + b, 0);

  const topExercisesByMuscle = useMemo(() => {
    const map: Record<MuscleGroup, Record<string, number>> = {
      Back: {},
      Legs: {},
      Chest: {},
      Arms: {},
      Shoulders: {},
      Core: {},
    };

    filteredSets.forEach((s: WorkoutSet) => {
      s.muscleGroups.forEach((mg: MuscleGroup) => {
        if (map[mg]) {
          map[mg][s.exerciseTitle] = (map[mg][s.exerciseTitle] || 0) + 1;
        }
      });
    });

    const result: Record<MuscleGroup, Array<{ title: string; count: number }>> = {
      Back: [],
      Legs: [],
      Chest: [],
      Arms: [],
      Shoulders: [],
      Core: [],
    };

    MUSCLE_GROUPS.forEach((mg) => {
      result[mg] = Object.entries(map[mg])
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);
    });

    return result;
  }, [filteredSets]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ color: '#fff', margin: 0 }}>
          🎯 Muscle Group Breakdown & Distribution
        </Title>
        <Text type="secondary">
          Analyze training balance across Back, Legs, Chest, Arms, Shoulders, and Core.
        </Text>
      </div>

      <TimeFilterBar />

      <Alert
        message="Compound Exercise Volume Attribution"
        description="Compound lifts (such as Deadlifts, Bench Press, Squats, and Rows) distribute their training volume and set counts to all target muscle groups based on biomechanical contribution."
        type="info"
        showIcon
        icon={<InfoCircleOutlined style={{ color: '#1890ff' }} />}
        style={{ backgroundColor: '#111b26', borderColor: '#153450', marginBottom: 20 }}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={10}>
          <MuscleRadarChart
            muscleGroups={muscleDistribution.muscleGroups}
            setsData={muscleDistribution.setsData}
            volumeData={muscleDistribution.volumeData}
            title="Muscle Balance Radar"
            height={320}
          />
        </Col>
        <Col xs={24} lg={14}>
          <MuscleBarChart
            muscleGroups={muscleDistribution.muscleGroups}
            setsData={muscleDistribution.setsData}
            volumeData={muscleDistribution.volumeData}
            title="Sets & Volume Proportions"
          />
        </Col>
      </Row>

      <Title level={4} style={{ color: '#d9d9d9', marginBottom: 16 }}>
        <DotChartOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        Muscle Group Profiles
      </Title>

      <Row gutter={[16, 16]}>
        {MUSCLE_GROUPS.map((mg) => {
          const setCount = muscleDistribution.setsByMuscle[mg] || 0;
          const volume = muscleDistribution.volumeByMuscle[mg] || 0;
          const setPct = totalSetsAcrossMuscles > 0 ? Math.round((setCount / totalSetsAcrossMuscles) * 100) : 0;
          const volPct = totalVolumeAcrossMuscles > 0 ? Math.round((volume / totalVolumeAcrossMuscles) * 100) : 0;
          const color = MUSCLE_COLORS[mg];
          const topEx = topExercisesByMuscle[mg] || [];

          return (
            <Col xs={24} sm={12} lg={8} key={mg}>
              <Card
                style={{
                  backgroundColor: '#141414',
                  borderColor: '#303030',
                  borderTop: `3px solid ${color}`,
                  height: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 24 }}>{MUSCLE_ICONS[mg]}</span>
                    <Text strong style={{ fontSize: 18, color }}>{mg}</Text>
                  </div>
                  <Tag color="geekblue" style={{ fontSize: 12 }}>
                    {setPct}% of total sets
                  </Tag>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <Text type="secondary">Total Sets</Text>
                    <Text strong style={{ color: '#fff' }}>{setCount} sets</Text>
                  </div>
                  <Progress percent={setPct} strokeColor={color} trailColor="#262626" size="small" showInfo={false} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8, marginBottom: 4 }}>
                    <Text type="secondary">Total Volume</Text>
                    <Text strong style={{ color: '#fa8c16' }}>{(volume / 1000).toFixed(1)} tonnes ({volPct}%)</Text>
                  </div>
                  <Progress percent={volPct} strokeColor="#fa8c16" trailColor="#262626" size="small" showInfo={false} />
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                    Top Exercises:
                  </Text>
                  {topEx.length > 0 ? (
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      {topEx.map((ex) => (
                        <div
                          key={ex.title}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 12,
                            padding: '3px 6px',
                            backgroundColor: '#1f1f1f',
                            borderRadius: 4,
                          }}
                        >
                          <Text ellipsis style={{ maxWidth: 180, color: '#d9d9d9' }}>{ex.title}</Text>
                          <span style={{ color: '#8c8c8c' }}>{ex.count} sets</span>
                        </div>
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary" style={{ fontSize: 12 }}>No sets recorded</Text>
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};
