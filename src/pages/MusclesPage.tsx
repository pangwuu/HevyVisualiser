import React, { useMemo } from 'react';
import { Row, Col, Card, Typography, Tag, Progress, Space, Alert } from 'antd';
import { DotChartOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { BicepsFlexed, Shield, Target, LayoutGrid, Bone } from 'lucide-react';
import { IconRun } from '@tabler/icons-react';
import { useWorkoutData } from '../hooks/useWorkoutData';
import { TimeFilterBar } from '../components/Filters/TimeFilterBar';
import { MuscleRadarChart } from '../components/Charts/MuscleRadarChart';
import { MuscleBarChart } from '../components/Charts/MuscleBarChart';
import { MUSCLE_GROUPS } from '../data/exerciseMapping';
import { MuscleGroup, WorkoutSet } from '../types';

const { Title, Text } = Typography;

const MUSCLE_ICONS: Record<MuscleGroup, React.ReactNode> = {
  Back: <Bone size={20} color="#1890ff" />,
  Legs: <IconRun size={20} color="#52c41a" />,
  Chest: <Shield size={20} color="#fa8c16" />,
  Arms: <BicepsFlexed size={20} color="#eb2f96" />,
  Shoulders: <Target size={20} color="#722ed1" />,
  Core: <LayoutGrid size={20} color="#13c2c2" />,
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
  const { filteredSets, muscleDistribution } = useWorkoutData();

  const muscleCardStats = useMemo(() => {
    return MUSCLE_GROUPS.map((mg) => {
      const targetSets = filteredSets.filter((s: WorkoutSet) => s.muscleGroups.includes(mg));
      const workingSets = targetSets.filter((s: WorkoutSet) => s.setType !== 'warmup');
      const totalVolume = workingSets.reduce((acc: number, s: WorkoutSet) => acc + ((s.weightKg || 0) * (s.reps || 0)), 0);

      const exerciseCounts: Record<string, number> = {};
      targetSets.forEach((s: WorkoutSet) => {
        exerciseCounts[s.exerciseTitle] = (exerciseCounts[s.exerciseTitle] || 0) + 1;
      });

      const topExercises = Object.entries(exerciseCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([title, sets]) => ({ title, sets }));

      return {
        muscleGroup: mg,
        totalSets: targetSets.length,
        workingSets: workingSets.length,
        totalVolumeKg: Math.round(totalVolume),
        topExercises,
        color: MUSCLE_COLORS[mg],
        icon: MUSCLE_ICONS[mg],
      };
    });
  }, [filteredSets]);

  const totalSetsAcrossMuscles = muscleDistribution.setsData.reduce((a: number, b: number) => a + b, 0);
  const totalVolumeAcrossMuscles = muscleDistribution.volumeData.reduce((a: number, b: number) => a + b, 0);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Target size={26} color="#1890ff" />
          Muscle Group Breakdown & Distribution
        </Title>
        <Text type="secondary">
          Track set volume, workload distribution across muscle groups, and compound exercise contributions.
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
        {muscleCardStats.map((stat) => {
          const setPct = totalSetsAcrossMuscles > 0 ? Math.round((stat.totalSets / totalSetsAcrossMuscles) * 100) : 0;
          const volPct = totalVolumeAcrossMuscles > 0 ? Math.round((stat.totalVolumeKg / totalVolumeAcrossMuscles) * 100) : 0;

          return (
            <Col xs={24} sm={12} lg={8} key={stat.muscleGroup}>
              <Card
                style={{
                  backgroundColor: '#141414',
                  borderColor: '#303030',
                  borderTop: `3px solid ${stat.color}`,
                  height: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 6, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      {stat.icon}
                    </div>
                    <Text strong style={{ fontSize: 18, color: stat.color }}>{stat.muscleGroup}</Text>
                  </div>
                  <Tag color="geekblue" style={{ fontSize: 12 }}>
                    {setPct}% of total sets
                  </Tag>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <Text type="secondary">Total Sets</Text>
                    <Text strong style={{ color: '#fff' }}>{stat.totalSets} sets</Text>
                  </div>
                  <Progress percent={setPct} strokeColor={stat.color} trailColor="#262626" size="small" showInfo={false} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8, marginBottom: 4 }}>
                    <Text type="secondary">Total Volume</Text>
                    <Text strong style={{ color: '#fa8c16' }}>{(stat.totalVolumeKg / 1000).toFixed(1)} tonnes ({volPct}%)</Text>
                  </div>
                  <Progress percent={volPct} strokeColor="#fa8c16" trailColor="#262626" size="small" showInfo={false} />
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                    Top Exercises:
                  </Text>
                  {stat.topExercises.length > 0 ? (
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      {stat.topExercises.map((ex) => (
                        <div
                          key={ex.title}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 12,
                            color: '#bfbfbf',
                          }}
                        >
                          <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ex.title}
                          </span>
                          <span style={{ color: '#8c8c8c' }}>{ex.sets} sets</span>
                        </div>
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary" style={{ fontSize: 12 }}>No sets logged yet</Text>
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
