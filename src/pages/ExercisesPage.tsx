import React, { useState } from 'react';
import { Card, Typography, Table, Input, Select, Tag, Space, Button } from 'antd';
import { SearchOutlined, LineChartOutlined } from '@ant-design/icons';
import { BicepsFlexed, Flame } from 'lucide-react';
import { IconRosetteNumber1, IconRosetteNumber2, IconRosetteNumber3 } from '@tabler/icons-react';
import { useWorkoutData } from '../hooks/useWorkoutData';
import { TimeFilterBar } from '../components/Filters/TimeFilterBar';
import { ExerciseProgressChart } from '../components/Charts/ExerciseProgressChart';
import { MUSCLE_GROUPS } from '../data/exerciseMapping';
import { ExerciseStats, MuscleGroup } from '../types';

const { Title, Text } = Typography;

export const ExercisesPage: React.FC = () => {
  const { exerciseStats, filteredSets } = useWorkoutData();

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
      render: (_: any, __: any, index: number) => {
        if (index === 0) return <span style={{ display: 'flex', alignItems: 'center', color: '#faad14', fontWeight: 700, paddingLeft: 8 }}><IconRosetteNumber1 size={25} color="#faad14" /></span>;
        if (index === 1) return <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d9d9d9', fontWeight: 700, paddingLeft: 8  }}><IconRosetteNumber2 size={25} color="#d9d9d9" /></span>;
        if (index === 2) return <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#d48806', fontWeight: 700, paddingLeft: 8  }}><IconRosetteNumber3 size={25} color="#d48806" /></span>;
        return <span style={{ color: '#8c8c8c', fontWeight: 600, paddingLeft: 8 }}>#{index + 1}</span>;
      },
      width: 90,
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
        <span style={{ fontWeight: 600, color: '#d9d9d9', display: 'flex', alignItems: 'center' }}>
          <Flame size={14} color="#52c41a" style={{ marginRight: 4 }} />
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
      render: (_: any, record: ExerciseStats) =>
        record.maxWeightKg > 0 ? (
          <span style={{ color: '#52c41a', fontWeight: 600 }}>{record.maxWeightKg} kg</span>
        ) : (
          <Tag color="default" style={{ fontSize: 11, backgroundColor: '#1f1f1f', borderColor: '#333', color: '#8c8c8c' }}>
            Bodyweight
          </Tag>
        ),
      sorter: (a: ExerciseStats, b: ExerciseStats) => a.maxWeightKg - b.maxWeightKg,
      width: 125,
    },
    {
      title: 'Best Performance',
      key: 'bestPerformance',
      render: (_: any, record: ExerciseStats) =>
        record.maxWeightKg > 0 ? (
          <span style={{ color: '#1890ff', fontWeight: 600 }}>
            {record.maxEstimated1RM} kg <Text type="secondary" style={{ fontSize: 11 }}>(1RM)</Text>
          </span>
        ) : (
          <span style={{ color: '#1890ff', fontWeight: 600 }}>
            {record.maxRepsPerSet} reps <Text type="secondary" style={{ fontSize: 11 }}>(Max Set)</Text>
          </span>
        ),
      sorter: (a: ExerciseStats, b: ExerciseStats) =>
        a.maxWeightKg > 0 ? a.maxEstimated1RM - b.maxEstimated1RM : a.maxRepsPerSet - b.maxRepsPerSet,
      width: 155,
    },
    {
      title: 'Total Volume',
      dataIndex: 'totalVolumeKg',
      key: 'totalVolumeKg',
      render: (_: any, record: ExerciseStats) =>
        record.maxWeightKg > 0 ? (
          <span style={{ color: '#fa8c16' }}>{(record.totalVolumeKg / 1000).toFixed(1)} t</span>
        ) : (
          <span style={{ color: '#fa8c16' }}>{record.totalReps.toLocaleString()} reps</span>
        ),
      sorter: (a: ExerciseStats, b: ExerciseStats) =>
        a.maxWeightKg > 0 ? a.totalVolumeKg - b.totalVolumeKg : a.totalReps - b.totalReps,
      width: 135,
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
        <Title level={2} style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <BicepsFlexed size={26} color="#1890ff" />
          Exercise Library & Strength Progress
        </Title>
        <Text type="secondary">
          Track individual exercise frequency, 1RM strength progression curves, and volume over time.
        </Text>
      </div>

      <TimeFilterBar />

      <div style={{ marginBottom: 24 }}>
        <ExerciseProgressChart
          exerciseStats={exerciseStats}
          allSets={filteredSets}
          defaultExercise={selectedExerciseForChart}
        />
      </div>

      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, color: '#fff' }}>
            <BicepsFlexed size={18} color="#1890ff" />
            <span>All Logged Exercises ({filteredExerciseStats.length})</span>
          </div>
        }
        style={{ backgroundColor: '#141414', borderColor: '#303030' }}
      >
        {/* Responsive Table Search & Filter Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <Input
            placeholder="Search exercise by name..."
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: '1 1 240px', maxWidth: 360 }}
            allowClear
          />
          <Select
            value={muscleFilter}
            onChange={setMuscleFilter}
            style={{ minWidth: 180, flex: '1 1 180px', maxWidth: 260 }}
            options={[
              { value: 'all', label: 'All Muscle Groups' },
              ...MUSCLE_GROUPS.map((mg) => ({ value: mg, label: mg })),
            ]}
          />
        </div>

        <Table
          dataSource={filteredExerciseStats}
          columns={columns}
          rowKey="exerciseTitle"
          pagination={{ pageSize: 15, showSizeChanger: true, pageSizeOptions: ['15', '30', '50', '100'] }}
          scroll={{ x: 780 }}
          size="middle"
        />
      </Card>
    </div>
  );
};
