import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Input, Tag, Space } from 'antd';
import {
  FireOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  SearchOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { BarChart3 } from 'lucide-react';
import dayjs from 'dayjs';
import { useWorkoutData } from '../hooks/useWorkoutData';
import { TimeFilterBar } from '../components/Filters/TimeFilterBar';
import { HeatmapCalendar } from '../components/Charts/HeatmapCalendar';
import { VolumeTrendChart } from '../components/Charts/VolumeTrendChart';
import { PRTimelineChart } from '../components/Charts/PRTimelineChart';
import { WorkoutSession, WorkoutSet } from '../types';

const { Title, Text } = Typography;

export const WorkoutsPage: React.FC = () => {
  const {
    filteredSessions,
    dashboardSummary,
    allSessions,
    weeklyVolumeTrend,
    personalRecords,
  } = useWorkoutData();

  const [searchQuery, setSearchQuery] = useState('');

  const searchedSessions = filteredSessions.filter((s: WorkoutSession) => {
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.exercises.some((e: string) => e.toLowerCase().includes(q)) ||
      s.workoutDate.includes(q)
    );
  });

  const columns = [
    {
      title: 'Date & Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (d: Date) => (
        <div>
          <Text strong style={{ color: '#d9d9d9' }}>{dayjs(d).format('ddd, D MMM YYYY')}</Text>
          <div style={{ color: '#8c8c8c', fontSize: 12 }}>{dayjs(d).format('h:mm A')}</div>
        </div>
      ),
      width: 170,
      sorter: (a: WorkoutSession, b: WorkoutSession) => a.startTime.getTime() - b.startTime.getTime(),
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Workout Title',
      dataIndex: 'title',
      key: 'title',
      render: (t: string) => <span style={{ fontWeight: 600, color: '#1890ff' }}>{t}</span>,
    },
    {
      title: 'Duration',
      dataIndex: 'durationMinutes',
      key: 'duration',
      render: (m: number) => <span>{m} mins</span>,
      width: 100,
    },
    {
      title: 'Total Volume',
      dataIndex: 'totalVolumeKg',
      key: 'volume',
      render: (v: number) => (
        <span style={{ color: '#fa8c16', fontWeight: 600 }}>
          {Math.round(v).toLocaleString()} kg
        </span>
      ),
      sorter: (a: WorkoutSession, b: WorkoutSession) => a.totalVolumeKg - b.totalVolumeKg,
      width: 130,
    },
    {
      title: 'Exercises & Sets',
      key: 'details',
      render: (_: any, record: WorkoutSession) => (
        <div>
          <div style={{ color: '#d9d9d9', fontSize: 13 }}>
            {record.exercises.length} exercises &bull; {record.workingSetsCount} working sets ({record.totalSetsCount} total)
          </div>
          <Space size={[0, 4]} wrap style={{ marginTop: 4 }}>
            {record.exercises.slice(0, 4).map((ex) => (
              <Tag key={ex} style={{ fontSize: 11, backgroundColor: '#1f1f1f', borderColor: '#303030', color: '#bfbfbf' }}>
                {ex}
              </Tag>
            ))}
            {record.exercises.length > 4 && (
              <Tag style={{ fontSize: 11, backgroundColor: '#1f1f1f', borderColor: '#303030', color: '#8c8c8c' }}>
                +{record.exercises.length - 4} more
              </Tag>
            )}
          </Space>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart3 size={26} color="#1890ff" />
          Workouts & Training Volume
        </Title>
        <Text type="secondary">
          Deep-dive into volume trends over time, workout consistency heatmaps, and session breakdown.
        </Text>
      </div>

      <TimeFilterBar />

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={8} lg={4.8 as any}>
          <Card size="small" style={{ backgroundColor: '#141414', borderColor: '#303030' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>Sessions</span>}
              value={dashboardSummary.totalWorkouts}
              prefix={<FireOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#fff', fontSize: 22, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={4.8 as any}>
          <Card size="small" style={{ backgroundColor: '#141414', borderColor: '#303030' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>Total Time</span>}
              value={dashboardSummary.totalTimeHours}
              suffix="hrs"
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#fff', fontSize: 22, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={4.8 as any}>
          <Card size="small" style={{ backgroundColor: '#141414', borderColor: '#303030' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>Total Volume</span>}
              value={dashboardSummary.totalVolumeTonnes}
              suffix="t"
              prefix={<ThunderboltOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fff', fontSize: 22, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={4.8 as any}>
          <Card size="small" style={{ backgroundColor: '#141414', borderColor: '#303030' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>Total Sets</span>}
              value={dashboardSummary.totalSets}
              prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#fff', fontSize: 22, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} lg={4.8 as any}>
          <Card size="small" style={{ backgroundColor: '#141414', borderColor: '#303030' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>Total Reps</span>}
              value={dashboardSummary.totalReps}
              valueStyle={{ color: '#fff', fontSize: 22, fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 20 }}>
        <HeatmapCalendar sessions={allSessions} title="Workout Consistency Heatmap" defaultRange="all" />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={14}>
          <VolumeTrendChart
            weeks={weeklyVolumeTrend.weeks}
            volumes={weeklyVolumeTrend.volumes}
            workoutsCount={weeklyVolumeTrend.workoutsCount}
            height={360}
          />
        </Col>
        <Col xs={24} lg={10}>
          <PRTimelineChart personalRecords={personalRecords} />
        </Col>
      </Row>

      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: '#fff' }}>All Workout Sessions ({searchedSessions.length})</span>
            <Input
              placeholder="Search by title, exercise, or date..."
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 280 }}
              allowClear
            />
          </div>
        }
        style={{ backgroundColor: '#141414', borderColor: '#303030' }}
      >
        <Table
          dataSource={searchedSessions}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '25', '50'] }}
          scroll={{ x: 800 }}
          expandable={{
            expandedRowRender: (record: WorkoutSession) => (
              <div style={{ padding: '8px 16px', backgroundColor: '#1f1f1f', borderRadius: 6 }}>
                <Text strong style={{ color: '#1890ff', display: 'block', marginBottom: 8 }}>
                  Detailed Sets for &quot;{record.title}&quot;:
                </Text>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                  {record.sets.map((set: WorkoutSet, idx: number) => (
                    <div
                      key={set.id || idx}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#141414',
                        borderRadius: 4,
                        border: '1px solid #303030',
                        fontSize: 12,
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#d9d9d9' }}>
                        Set {set.setIndex + 1}: {set.exerciseTitle}
                      </div>
                      <div style={{ color: '#52c41a', marginTop: 2 }}>
                        {set.weightKg ? `${set.weightKg} kg × ` : ''}{set.reps ? `${set.reps} reps` : ''}
                        {set.distanceKm ? `${set.distanceKm} km` : ''}
                        {set.durationSeconds ? ` (${Math.round(set.durationSeconds / 60)} mins)` : ''}
                        <Tag style={{ marginLeft: 6, fontSize: 10 }} color={set.setType === 'warmup' ? 'default' : 'blue'}>
                          {set.setType}
                        </Tag>
                      </div>
                      {set.exerciseNotes && (
                        <div style={{ color: '#8c8c8c', fontStyle: 'italic', marginTop: 2 }}>
                          &quot;{set.exerciseNotes}&quot;
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};
