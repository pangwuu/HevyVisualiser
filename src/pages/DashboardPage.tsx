import React from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Space, Button } from 'antd';
import {
  FireOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  AppstoreOutlined,
  HeartFilled,
  RightOutlined,
} from '@ant-design/icons';
import { Dumbbell, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { useWorkoutData } from '../hooks/useWorkoutData';
import { TimeFilterBar } from '../components/Filters/TimeFilterBar';
import { HeatmapCalendar } from '../components/Charts/HeatmapCalendar';
import { MuscleRadarChart } from '../components/Charts/MuscleRadarChart';

const { Title, Text } = Typography;

export const DashboardPage: React.FC = () => {
  const {
    dashboardSummary,
    streaks,
    filteredSessions,
    muscleDistribution,
    allSessions,
  } = useWorkoutData();

  const sessionColumns = [
    {
      title: 'Date',
      dataIndex: 'startTime',
      key: 'date',
      render: (d: Date) => dayjs(d).format('ddd, D MMM YYYY, h:mm A'),
      width: 190,
    },
    {
      title: 'Workout Title',
      dataIndex: 'title',
      key: 'title',
      render: (t: string) => <Text strong style={{ color: '#d9d9d9' }}>{t}</Text>,
    },
    {
      title: 'Duration',
      dataIndex: 'durationMinutes',
      key: 'duration',
      render: (m: number) => <span>{m} mins</span>,
      width: 100,
    },
    {
      title: 'Volume',
      dataIndex: 'totalVolumeKg',
      key: 'volume',
      render: (v: number) => <span style={{ color: '#fa8c16' }}>{Math.round(v).toLocaleString()} kg</span>,
      width: 120,
    },
    {
      title: 'Working Sets',
      dataIndex: 'workingSetsCount',
      key: 'sets',
      render: (s: number, record: any) => <span>{s} / {record.totalSetsCount}</span>,
      width: 120,
    },
    {
      title: 'Muscles Hit',
      dataIndex: 'muscleGroups',
      key: 'muscles',
      render: (mgs: string[]) => (
        <Space size={[0, 4]} wrap>
          {mgs.map((mg) => (
            <Tag key={mg} color="blue" style={{ fontSize: 11 }}>{mg}</Tag>
          ))}
        </Space>
      ),
    },
  ];

  const recentSessions = [...filteredSessions].reverse().slice(0, 8);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Dumbbell size={26} color="#1890ff" />
          Training Overview
        </Title>
        <Text type="secondary">
          Track consistency, training volume, muscle distribution, and performance progress.
        </Text>
      </div>

      <TimeFilterBar />

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ backgroundColor: '#141414', borderColor: '#303030' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>Total Workouts</span>}
              value={dashboardSummary.totalWorkouts}
              prefix={<FireOutlined style={{ color: '#52c41a' }} />}
              suffix="sessions"
              valueStyle={{ color: '#fff', fontSize: 26, fontWeight: 700 }}
            />
            <div style={{ marginTop: 6, color: '#8c8c8c', fontSize: 12 }}>
              Across selected time window
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ backgroundColor: '#141414', borderColor: '#303030' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>Time in Gym</span>}
              value={dashboardSummary.totalTimeHours}
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              suffix="hours"
              valueStyle={{ color: '#fff', fontSize: 26, fontWeight: 700 }}
            />
            <div style={{ marginTop: 6, color: '#8c8c8c', fontSize: 12 }}>
              Avg: {dashboardSummary.avgDurationMinutes} mins / session
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ backgroundColor: '#141414', borderColor: '#303030' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>Volume Lifted</span>}
              value={dashboardSummary.totalVolumeTonnes}
              prefix={<ThunderboltOutlined style={{ color: '#fa8c16' }} />}
              suffix="tonnes"
              valueStyle={{ color: '#fff', fontSize: 26, fontWeight: 700 }}
            />
            <div style={{ marginTop: 6, color: '#8c8c8c', fontSize: 12 }}>
              {dashboardSummary.totalSets} total sets ({dashboardSummary.totalReps.toLocaleString()} reps)
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card style={{ backgroundColor: '#141414', borderColor: '#303030' }}>
            <Statistic
              title={<span style={{ color: '#8c8c8c' }}>Workout Streak</span>}
              value={streaks.longestStreak}
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
              suffix="days max"
              valueStyle={{ color: '#fff', fontSize: 26, fontWeight: 700 }}
            />
            <div style={{ marginTop: 6, color: '#8c8c8c', fontSize: 12 }}>
              Current streak: <strong style={{ color: '#52c41a' }}>{streaks.currentStreak} days</strong>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12}>
          <Card size="small" style={{ backgroundColor: '#1f1f1f', borderColor: '#303030' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Top Muscle Focus</Text>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#1890ff', marginTop: 2 }}>
                  <AppstoreOutlined style={{ marginRight: 6 }} />
                  {dashboardSummary.mostTrainedMuscle}
                </div>
              </div>
              <Tag color="blue" style={{ fontSize: 13, padding: '4px 8px' }}>
                {dashboardSummary.mostTrainedMuscleSets} sets
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card size="small" style={{ backgroundColor: '#1f1f1f', borderColor: '#303030' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Favourite Exercise</Text>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#fa8c16', marginTop: 2 }}>
                  <HeartFilled style={{ marginRight: 6 }} />
                  {dashboardSummary.favouriteExercise}
                </div>
              </div>
              <Tag color="orange" style={{ fontSize: 13, padding: '4px 8px' }}>
                {dashboardSummary.favouriteExerciseSets} sets
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} lg={15}>
          <HeatmapCalendar sessions={allSessions} title="Yearly Consistency & Heatmap" defaultRange="1y" />
        </Col>
        <Col xs={24} lg={9}>
          <MuscleRadarChart
            muscleGroups={muscleDistribution.muscleGroups}
            setsData={muscleDistribution.setsData}
            volumeData={muscleDistribution.volumeData}
            height={260}
          />
        </Col>
      </Row>

      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, color: '#fff' }}>
              <Clock size={18} color="#1890ff" />
              Recent Workout Sessions
            </span>
            <Link to="/workouts">
              <Button type="link" size="small" icon={<RightOutlined />}>
                View All Workouts
              </Button>
            </Link>
          </div>
        }
        style={{ backgroundColor: '#141414', borderColor: '#303030' }}
      >
        <Table
          dataSource={recentSessions}
          columns={sessionColumns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 750 }}
          size="middle"
        />
      </Card>
    </div>
  );
};
