import React, { useState, useMemo, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Card, Select, Switch, Space, Typography, Row, Col, Statistic, Tag, Empty, Segmented } from 'antd';
import { TrendingUp, Trophy, Zap, Layers, Weight, Flame } from 'lucide-react';
import dayjs from 'dayjs';
import './chartSetup';
import { WorkoutSet, ExerciseStats } from '../../types';
import { calculateLinearRegressionTrendline } from '../../utils/calculations';

const { Text } = Typography;

interface ExerciseProgressChartProps {
  exerciseStats: ExerciseStats[];
  allSets: WorkoutSet[];
  defaultExercise?: string;
  height?: number;
}

export const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({
  exerciseStats,
  allSets,
  defaultExercise,
  height = 360,
}) => {
  const [selectedExercise, setSelectedExercise] = useState<string>(() => {
    if (defaultExercise) return defaultExercise;
    const bench = exerciseStats.find((e) => e.exerciseTitle.toLowerCase().includes('bench press (dumbbell)'));
    if (bench) return bench.exerciseTitle;
    return exerciseStats[0]?.exerciseTitle || '';
  });

  useEffect(() => {
    if (defaultExercise) {
      setSelectedExercise(defaultExercise);
    }
  }, [defaultExercise]);

  useEffect(() => {
    if (!selectedExercise && exerciseStats.length > 0) {
      setSelectedExercise(exerciseStats[0].exerciseTitle);
    }
  }, [exerciseStats, selectedExercise]);

  const [showRawSets, setShowRawSets] = useState<boolean>(true);
  const [showConfidenceBand, setShowConfidenceBand] = useState<boolean>(true);
  const [showTrendline, setShowTrendline] = useState<boolean>(true);

  const currentStats = useMemo(() => {
    return exerciseStats.find((e) => e.exerciseTitle === selectedExercise);
  }, [exerciseStats, selectedExercise]);

  const exerciseSets = useMemo(() => {
    if (!selectedExercise) return [];
    return allSets
      .filter((s) => s.exerciseTitle === selectedExercise && s.reps !== undefined && s.reps > 0)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [allSets, selectedExercise]);

  const hasWeight = useMemo(() => {
    return exerciseSets.some((s) => (s.weightKg || 0) > 0);
  }, [exerciseSets]);

  const isPureBodyweight = !hasWeight;

  const [metricMode, setMetricMode] = useState<'weight' | 'reps'>('weight');

  // Auto-switch to reps mode for bodyweight exercises, or weight mode for loaded exercises
  useEffect(() => {
    setMetricMode(isPureBodyweight ? 'reps' : 'weight');
  }, [selectedExercise, isPureBodyweight]);

  const sessionAggregates = useMemo(() => {
    const sessionMap = new Map<string, {
      date: dayjs.Dayjs;
      dateStr: string;
      max1RM: number;
      min1RM: number;
      avg1RM: number;
      maxWeight: number;
      maxReps: number;
      minReps: number;
      totalReps: number;
      avgReps: number;
      sets: WorkoutSet[];
    }>();

    exerciseSets.forEach((set) => {
      const e1RM = set.estimated1RM || set.weightKg || 0;
      const reps = set.reps || 0;
      const weight = set.weightKg || 0;

      if (!sessionMap.has(set.workoutDate)) {
        sessionMap.set(set.workoutDate, {
          date: dayjs(set.startTime),
          dateStr: dayjs(set.startTime).format('DD MMM YYYY'),
          max1RM: e1RM,
          min1RM: e1RM,
          avg1RM: e1RM,
          maxWeight: weight,
          maxReps: reps,
          minReps: reps,
          totalReps: reps,
          avgReps: reps,
          sets: [set],
        });
      } else {
        const item = sessionMap.get(set.workoutDate)!;
        item.sets.push(set);
        if (e1RM > item.max1RM) item.max1RM = e1RM;
        if (e1RM < item.min1RM) item.min1RM = e1RM;
        if (weight > item.maxWeight) item.maxWeight = weight;
        if (reps > item.maxReps) item.maxReps = reps;
        if (reps < item.minReps) item.minReps = reps;
        item.totalReps += reps;
        item.avg1RM = item.sets.reduce((sum, s) => sum + (s.estimated1RM || s.weightKg || 0), 0) / item.sets.length;
        item.avgReps = item.totalReps / item.sets.length;
      }
    });

    return Array.from(sessionMap.values()).sort((a, b) => a.date.unix() - b.date.unix());
  }, [exerciseSets]);

  const trendlineData = useMemo(() => {
    const values = metricMode === 'reps'
      ? sessionAggregates.map((s) => s.maxReps)
      : sessionAggregates.map((s) => s.max1RM);
    return calculateLinearRegressionTrendline(values);
  }, [sessionAggregates, metricMode]);

  const allTimePR = useMemo<{ pr: number; prSet: WorkoutSet | null }>(() => {
    let pr = 0;
    let prSet: WorkoutSet | null = null;
    exerciseSets.forEach((s) => {
      if (metricMode === 'reps') {
        if (s.reps && s.reps > pr) {
          pr = s.reps;
          prSet = s;
        }
      } else {
        if (s.estimated1RM && s.estimated1RM > pr) {
          pr = s.estimated1RM;
          prSet = s;
        }
      }
    });
    return { pr, prSet };
  }, [exerciseSets, metricMode]);

  const latestSession = sessionAggregates[sessionAggregates.length - 1];

  const chartData = useMemo(() => {
    const labels = sessionAggregates.map((s) => s.dateStr);
    const datasets: any[] = [];

    if (metricMode === 'reps') {
      if (showConfidenceBand) {
        datasets.push({
          label: 'Upper Confidence (+5%)',
          data: sessionAggregates.map((s) => Number((s.maxReps * 1.05).toFixed(1))),
          borderColor: 'transparent',
          backgroundColor: 'rgba(24, 144, 255, 0.08)',
          fill: '+1',
          pointRadius: 0,
          tension: 0.3,
        });

        datasets.push({
          label: 'Lower Confidence (-5%)',
          data: sessionAggregates.map((s) => Number((s.maxReps * 0.95).toFixed(1))),
          borderColor: 'transparent',
          backgroundColor: 'rgba(24, 144, 255, 0.08)',
          fill: false,
          pointRadius: 0,
          tension: 0.3,
        });
      }

      datasets.push({
        label: 'Max Reps in Set',
        data: sessionAggregates.map((s) => s.maxReps),
        borderColor: '#1890ff',
        backgroundColor: '#1890ff',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.25,
      });

      if (showTrendline && sessionAggregates.length > 0) {
        datasets.push({
          label: 'Reps Trendline',
          data: trendlineData,
          borderColor: '#13c2c2',
          backgroundColor: '#13c2c2',
          borderWidth: 2,
          borderDash: [5, 4],
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0,
        });
      }

      datasets.push({
        label: 'Total Reps (Session)',
        data: sessionAggregates.map((s) => s.totalReps),
        borderColor: '#fa8c16',
        backgroundColor: '#fa8c16',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.25,
      });
    } else {
      if (showConfidenceBand) {
        datasets.push({
          label: 'Upper Confidence (+5%)',
          data: sessionAggregates.map((s) => Number((s.max1RM * 1.05).toFixed(1))),
          borderColor: 'transparent',
          backgroundColor: 'rgba(24, 144, 255, 0.08)',
          fill: '+1',
          pointRadius: 0,
          tension: 0.3,
        });

        datasets.push({
          label: 'Lower Confidence (-5%)',
          data: sessionAggregates.map((s) => Number((s.min1RM * 0.95).toFixed(1))),
          borderColor: 'transparent',
          backgroundColor: 'rgba(24, 144, 255, 0.08)',
          fill: false,
          pointRadius: 0,
          tension: 0.3,
        });
      }

      datasets.push({
        label: 'Predicted 1RM (kg)',
        data: sessionAggregates.map((s) => s.max1RM),
        borderColor: '#1890ff',
        backgroundColor: '#1890ff',
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.25,
      });

      if (showTrendline && sessionAggregates.length > 0) {
        datasets.push({
          label: '1RM Trendline',
          data: trendlineData,
          borderColor: '#13c2c2',
          backgroundColor: '#13c2c2',
          borderWidth: 2,
          borderDash: [5, 4],
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0,
        });
      }

      datasets.push({
        label: 'Heaviest Weight (kg)',
        data: sessionAggregates.map((s) => s.maxWeight),
        borderColor: '#fa8c16',
        backgroundColor: '#fa8c16',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.25,
      });
    }

    return {
      labels,
      datasets,
    };
  }, [sessionAggregates, trendlineData, showConfidenceBand, showTrendline, metricMode]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#d9d9d9',
          filter: (item: any) => !item.text.includes('Confidence'),
        },
      },
      tooltip: {
        callbacks: {
          afterBody: (context: any) => {
            const dataIndex = context[0].dataIndex;
            const session = sessionAggregates[dataIndex];
            if (!session) return '';
            const setDetails = session.sets
              .map((s) => {
                if (metricMode === 'reps' || !s.weightKg) {
                  return `• ${s.reps} reps (${s.setType}${s.weightKg ? ` @ ${s.weightKg}kg` : ''})`;
                }
                return `• ${s.weightKg}kg × ${s.reps} reps (${s.setType}${s.estimated1RM ? ` → 1RM: ${s.estimated1RM}kg` : ''})`;
              })
              .join('\n');
            return `\nSets in this session:\n${setDetails}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#262626' },
        ticks: { color: '#8c8c8c', maxTicksLimit: 8 },
      },
      y: {
        grid: { color: '#262626' },
        ticks: {
          color: '#8c8c8c',
          precision: metricMode === 'reps' ? 0 : undefined,
        },
        title: {
          display: true,
          text: metricMode === 'reps' ? 'Reps / Max Reps' : 'Weight / Est 1RM (kg)',
          color: '#8c8c8c',
        },
      },
    },
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, color: '#fff' }}>
            <TrendingUp size={18} color="#1890ff" />
            <span>
              {metricMode === 'reps'
                ? 'Exercise Rep Progression (Bodyweight / Calisthenics)'
                : 'Exercise Strength Progression (Estimated 1RM)'}
            </span>
          </div>

          {hasWeight && (
            <Segmented
              size="small"
              value={metricMode}
              onChange={(val) => setMetricMode(val as 'weight' | 'reps')}
              options={[
                { label: 'Weight & 1RM', value: 'weight' },
                { label: 'Reps Only', value: 'reps' },
              ]}
            />
          )}
        </div>
      }
      style={{ backgroundColor: '#141414', borderColor: '#303030' }}
    >
      {/* Responsive Exercise Selector & Controls Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: 12,
          backgroundColor: '#1f1f1f',
          borderRadius: 8,
          border: '1px solid #2a2a2a',
          marginBottom: 16,
        }}
      >
        <div style={{ flex: '1 1 260px', minWidth: 220 }}>
          <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
            SELECT EXERCISE:
          </Text>
          <Select
            showSearch
            style={{ width: '100%' }}
            value={selectedExercise}
            onChange={(val) => setSelectedExercise(val)}
            placeholder="Select an exercise"
            optionFilterProp="label"
            options={exerciseStats.map((e) => ({
              value: e.exerciseTitle,
              label: `${e.exerciseTitle} (${e.totalSessions} sessions${e.isBodyweight ? ' • BW' : ''})`,
            }))}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Space size="small">
            <Switch
              size="small"
              checked={showTrendline}
              onChange={setShowTrendline}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>Trendline</Text>
          </Space>
          <Space size="small">
            <Switch
              size="small"
              checked={showConfidenceBand}
              onChange={setShowConfidenceBand}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>Confidence Band</Text>
          </Space>
          <Space size="small">
            <Switch
              size="small"
              checked={showRawSets}
              onChange={setShowRawSets}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>Detailed Stats</Text>
          </Space>
        </div>
      </div>

      {selectedExercise && currentStats ? (
        <>
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ backgroundColor: '#1a1a1a', borderColor: '#303030' }}>
                <Statistic
                  title={<span style={{ color: '#8c8c8c', fontSize: 11 }}>{metricMode === 'reps' ? 'All-Time Best Set' : 'All-Time Est 1RM PR'}</span>}
                  value={metricMode === 'reps' ? (allTimePR.prSet?.reps || 0) : allTimePR.pr}
                  suffix={metricMode === 'reps' ? 'reps' : 'kg'}
                  valueStyle={{ color: '#52c41a', fontSize: 18, fontWeight: 700 }}
                  prefix={<Trophy size={15} color="#52c41a" />}
                />
                {allTimePR.prSet && (
                  <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 2 }}>
                    {metricMode === 'reps'
                      ? `${allTimePR.prSet.reps} reps (${allTimePR.prSet.workoutDate})`
                      : `${allTimePR.prSet.weightKg}kg × ${allTimePR.prSet.reps} reps`}
                  </Text>
                )}
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ backgroundColor: '#1a1a1a', borderColor: '#303030' }}>
                <Statistic
                  title={<span style={{ color: '#8c8c8c', fontSize: 11 }}>{metricMode === 'reps' ? 'Latest Session Best' : 'Latest Est 1RM'}</span>}
                  value={metricMode === 'reps' ? (latestSession?.maxReps || 0) : (latestSession?.max1RM || 0)}
                  suffix={metricMode === 'reps' ? 'reps' : 'kg'}
                  valueStyle={{ color: '#1890ff', fontSize: 18, fontWeight: 700 }}
                  prefix={<Zap size={15} color="#1890ff" />}
                />
                {latestSession && (
                  <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 2 }}>
                    {latestSession.dateStr}
                  </Text>
                )}
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ backgroundColor: '#1a1a1a', borderColor: '#303030' }}>
                <Statistic
                  title={<span style={{ color: '#8c8c8c', fontSize: 11 }}>Total Sets Logged</span>}
                  value={currentStats.totalSets}
                  suffix="sets"
                  valueStyle={{ color: '#d9d9d9', fontSize: 18 }}
                  prefix={<Layers size={15} color="#d9d9d9" />}
                />
                <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 2 }}>
                  across {currentStats.totalSessions} workouts
                </Text>
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ backgroundColor: '#1a1a1a', borderColor: '#303030' }}>
                <Statistic
                  title={<span style={{ color: '#8c8c8c', fontSize: 11 }}>{metricMode === 'reps' ? 'Total Reps Logged' : 'Total Volume'}</span>}
                  value={metricMode === 'reps' ? currentStats.totalReps.toLocaleString() : (currentStats.totalVolumeKg / 1000).toFixed(1)}
                  suffix={metricMode === 'reps' ? 'reps' : 't'}
                  valueStyle={{ color: '#fa8c16', fontSize: 18 }}
                  prefix={metricMode === 'reps' ? <Flame size={15} color="#fa8c16" /> : <Weight size={15} color="#fa8c16" />}
                />
                <div style={{ marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentStats.muscleGroups.map((mg) => (
                    <Tag key={mg} color="blue" style={{ fontSize: 9, marginRight: 2, padding: '0 4px' }}>{mg}</Tag>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>

          <div style={{ height }}>
            {sessionAggregates.length > 0 ? (
              <Line data={chartData} options={options} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Empty description="No set records for this exercise" />
              </div>
            )}
          </div>

          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {metricMode === 'reps'
                ? 'Tracking: Max Reps per set & Total Session Reps'
                : 'Formula: Epley 1RM = Weight × (1 + Reps / 30)'}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              First logged: {currentStats.firstDate} &nbsp;|&nbsp; Last logged: {currentStats.lastDate}
            </Text>
          </div>
        </>
      ) : (
        <Empty description="Please select an exercise to view its progression" />
      )}
    </Card>
  );
};
