import React, { useState } from 'react';
import { Card, Typography, Table, Input, Select, Tag, Space, Button } from 'antd';
import { SearchOutlined, LineChartOutlined, FireFilled } from '@ant-design/icons';
import { useWorkoutData } from '../hooks/useWorkoutData';
import { TimeFilterBar } from '../components/Filters/TimeFilterBar';
import { ExerciseProgressChart } from '../components/Charts/ExerciseProgressChart';
import { MUSCLE_GROUPS } from '../data/exerciseMapping';
import { ExerciseStats, MuscleGroup } from '../types';

const { Title, Text } = Typography;

export const ExercisesPage: React.FC = () => {
  const { exerciseStats, allSets } = useWorkoutData();

  const [selectedExerciseForChart, setSelectedExerciseForChart] = useState<string>('Bench Press (Dumbbell)');
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string>('all');

  const filteredExerciseStats = exerciseStats.filter((ex: ExerciseStats) => {
    const matchesSearch = ex.exerciseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle =
      muscleFilter === 'all' || ex.muscleGroups.includes(muscleFilter as MuscleGroup);
    return matchesSearch && matchesMuscle;
  });

  const columns = [
    {
      title: 'Rank',
      key: 'rank',
      render: (_: any, __: any, index: number) => (
        <span style={{ color: index < 3 ? '#faad14' : '#8c8c8c', fontWeight: 600 }}>
          {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `#${index + 1}`}
        </span>
      ),
      width: 80,
    },
    {
      title: 'Exercise Name',
      dataIndex: 'exerciseTitle',
      key: 'exerciseTitle',
      render: (text: string) => (
        <Button
          type="link"
          style={{ padding: 0, fontWeight: 600, color: '#1890ff', fontSize: 14 }}
          onClick={() => setSelectedExerciseForChart(text)}
        >
          {text}
        </Button>
      ),
    },
    {
      title: 'Target Muscles',
      dataIndex: 'muscleGroups',
      key: 'muscleGroups',
      render: (mgs: MuscleGroup[]) => (
        <Space size={[0, 4]} wrap>
          {mgs.map((mg) => (
            <Tag key={mg} color="blue" style={{ fontSize: 11 }}>
              {mg}
            </Tag>
          ))}
        </Space>
      ),
      width: 180,
    },
    {
      title: 'Sessions',
      dataIndex: 'totalSessions',
      key: 'totalSessions',
      render: (sessions: number) => (
        <span style={{ fontWeight: 600, color: '#d9d9d9' }}>
          <FireFilled style={{ color: '#52c41a', marginRight: 4 }} />
          {sessions}
        </span>
      ),
      sorter: (a: ExerciseStats, b: ExerciseStats) => a.totalSessions - b.totalSessions,
      defaultSortOrder: 'descend' as const,
      width: 110,
    },
    {
      title: 'Total Sets',
      dataIndex: 'totalSets',
      key: 'totalSets',
      sorter: (a: ExerciseStats, b: ExerciseStats) => a.totalSets - b.totalSets,
      width: 110,
    },
    {
      title: 'Best Weight',
      dataIndex: 'maxWeightKg',
      key: 'maxWeightKg',
      render: (w: number) => (w > 0 ? <span style={{ color: '#52c41a', fontWeight: 600 }}>{w} kg</span> : '--'),
      sorter: (a: ExerciseStats, b: ExerciseStats) => a.maxWeightKg - b.maxWeightKg,
      width: 120,
    },
    {
      title: 'Max Est. 1RM',
      dataIndex: 'maxEstimated1RM',
      key: 'maxEstimated1RM',
      render: (rm: number) => (rm > 0 ? <span style={{ color: '#1890ff', fontWeight: 600 }}>{rm} kg</span> : '--'),
      sorter: (a: ExerciseStats, b: ExerciseStats) => a.maxEstimated1RM - b.maxEstimated1RM,
      width: 130,
    },
    {
      title: 'Total Volume',
      dataIndex: 'totalVolumeKg',
      key: 'totalVolumeKg',
      render: (vol: number) => (
        <span style={{ color: '#fa8c16' }}>{(vol / 1000).toFixed(1)} t</span>
      ),
      sorter: (a: ExerciseStats, b: ExerciseStats) => a.totalVolumeKg - b.totalVolumeKg,
      width: 130,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: ExerciseStats) => (
        <Button
          size="small"
          type="primary"
          ghost
          icon={<LineChartOutlined />}
          onClick={() => {
            setSelectedExerciseForChart(record.exerciseTitle);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          View Progress
        </Button>
      ),
      width: 130,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ color: '#fff', margin: 0 }}>
          💪 Exercise Library & Strength Progress
        </Title>
        <Text type="secondary">
          Track individual exercise frequency, 1RM strength progression curves, and volume over time.
        </Text>
      </div>

      <TimeFilterBar />

      <div style={{ marginBottom: 24 }}>
        <ExerciseProgressChart
          exerciseStats={exerciseStats}
          allSets={allSets}
          defaultExercise={selectedExerciseForChart}
        />
      </div>

      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: '#fff' }}>
              All Logged Exercises ({filteredExerciseStats.length})
            </span>
            <Space wrap>
              <Select
                value={muscleFilter}
                onChange={setMuscleFilter}
                style={{ width: 150 }}
                options={[
                  { value: 'all', label: 'All Muscle Groups' },
                  ...MUSCLE_GROUPS.map((mg) => ({ value: mg, label: mg })),
                ]}
              />
              <Input
                placeholder="Search exercise..."
                prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 220 }}
                allowClear
              />
            </Space>
          </div>
        }
        style={{ backgroundColor: '#141414', borderColor: '#303030' }}
      >
        <Table
          dataSource={filteredExerciseStats}
          columns={columns}
          rowKey="exerciseTitle"
          pagination={{ pageSize: 15, showSizeChanger: true, pageSizeOptions: ['15', '30', '50', '100'] }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};
