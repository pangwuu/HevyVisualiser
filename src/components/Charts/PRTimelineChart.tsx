import React, { useState, useMemo } from 'react';
import { Card, Timeline, Tag, Typography, Select, Empty, Space } from 'antd';
import { TrophyFilled, CrownOutlined } from '@ant-design/icons';
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

  const uniqueExercises = useMemo(() => {
    const set = new Set(personalRecords.map((pr) => pr.exerciseTitle));
    return Array.from(set).sort();
  }, [personalRecords]);

  const filteredPRs = useMemo(() => {
    let list = personalRecords;
    if (selectedExercise !== 'all') {
      list = list.filter((pr) => pr.exerciseTitle === selectedExercise);
    }
    return list.slice(0, 30); // Show top 30 most recent PR events
  }, [personalRecords, selectedExercise]);

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CrownOutlined style={{ color: '#faad14' }} />
            {title}
          </span>
          <Select
            style={{ width: 220 }}
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
      {filteredPRs.length > 0 ? (
        <div style={{ maxHeight: 380, overflowY: 'auto', paddingRight: 8 }}>
          <Timeline
            mode="left"
            items={filteredPRs.map((pr) => ({
              label: (
                <div style={{ color: '#8c8c8c', fontSize: 12 }}>
                  {dayjs(pr.date).format('DD MMM YYYY')}
                </div>
              ),
              dot: <TrophyFilled style={{ color: '#faad14', fontSize: 14 }} />,
              children: (
                <div style={{ marginBottom: 12 }}>
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
                    <Text style={{ color: '#52c41a', fontWeight: 600 }}>
                      🔥 {pr.weightKg} kg × {pr.reps} reps
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
      ) : (
        <Empty description="No personal records found for this filter" />
      )}
    </Card>
  );
};
