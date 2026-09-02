import React, { useState, useMemo } from 'react';
import { Card, Timeline, Tag, Typography, Select, Empty, Space, Button } from 'antd';
import { Trophy, Flame, Crown } from 'lucide-react';
import dayjs from 'dayjs';
import { PersonalRecord } from '../../types';

const { Text } = Typography;

interface PRTimelineChartProps {
  personalRecords: PersonalRecord[];
  title?: string;
}

export const PRTimelineChart: React.FC<PRTimelineChartProps> = ({
  personalRecords,
  title = 'Personal Records (PR) Timeline',
}) => {
  const [selectedExercise, setSelectedExercise] = useState<string>('all');
  const [showAll, setShowAll] = useState<boolean>(false);

  const uniqueExercises = useMemo(() => {
    const set = new Set(personalRecords.map((pr) => pr.exerciseTitle));
    return Array.from(set).sort();
  }, [personalRecords]);

  // Sort newest first for intuitive timeline reading
  const allFilteredPRs = useMemo(() => {
    let list = [...personalRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (selectedExercise !== 'all') {
      list = list.filter((pr) => pr.exerciseTitle === selectedExercise);
    }
    return list;
  }, [personalRecords, selectedExercise]);

  const displayedPRs = useMemo(() => {
    if (showAll || allFilteredPRs.length <= 25) {
      return allFilteredPRs;
    }
    return allFilteredPRs.slice(0, 25);
  }, [allFilteredPRs, showAll]);

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Crown size={18} color="#faad14" />
            <span>{title}</span>
            <Tag color="gold" style={{ fontSize: 11, fontWeight: 600 }}>
              {allFilteredPRs.length} PRs
            </Tag>
          </span>
          <Select
            style={{ width: 240 }}
            value={selectedExercise}
            onChange={setSelectedExercise}
            options={[
              { value: 'all', label: `All Exercises (${personalRecords.length} PRs)` },
              ...uniqueExercises.map((ex) => ({
                value: ex,
                label: ex,
              })),
            ]}
          />
        </div>
      }
      style={{ backgroundColor: '#141414', borderColor: '#303030' }}
    >
      {displayedPRs.length > 0 ? (
        <div>
          <div style={{ maxHeight: showAll ? 650 : 420, overflowY: 'auto', paddingRight: 8 }}>
            <Timeline
              mode="left"
              items={displayedPRs.map((pr) => ({
                label: (
                  <div style={{ color: '#8c8c8c', fontSize: 12 }}>
                    {dayjs(pr.date).format('DD MMM YYYY')}
                  </div>
                ),
                dot: <Trophy size={14} color="#faad14" />,
                children: (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Text strong style={{ color: '#d9d9d9', fontSize: 14 }}>
                        {pr.exerciseTitle}
                      </Text>
                      {pr.muscleGroups.map((mg) => (
                        <Tag key={mg} color="blue" style={{ fontSize: 11 }}>
                          {mg}
                        </Tag>
                      ))}
                    </div>
                    <Space size="middle" style={{ marginTop: 4 }}>
                      <Text style={{ color: '#52c41a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Flame size={14} color="#52c41a" />
                        {pr.weightKg} kg × {pr.reps} reps
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        (Est. 1RM: <span style={{ color: '#1890ff', fontWeight: 600 }}>{pr.estimated1RM} kg</span>)
                      </Text>
                    </Space>
                  </div>
                ),
              }))}
            />
          </div>

          {allFilteredPRs.length > 25 && (
            <div style={{ textAlign: 'center', paddingTop: 12, borderTop: '1px solid #262626', marginTop: 8 }}>
              <Button
                type="dashed"
                size="small"
                onClick={() => setShowAll(!showAll)}
                style={{ color: '#1890ff', borderColor: '#1890ff' }}
              >
                {showAll ? 'Show Less (Top 25 PRs)' : `Show All ${allFilteredPRs.length} Personal Records`}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Empty description="No personal records found for this filter" />
      )}
    </Card>
  );
};
