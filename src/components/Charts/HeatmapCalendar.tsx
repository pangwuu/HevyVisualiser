import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Tooltip, Card, Typography, Segmented } from 'antd';
import { FireFilled } from '@ant-design/icons';
import { WorkoutSession } from '../../types';

const { Text } = Typography;

interface HeatmapCalendarProps {
  sessions: WorkoutSession[];
  title?: string;
  defaultRange?: '1y' | 'all';
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({
  sessions,
  title = 'Workout Consistency Heatmap',
  defaultRange = '1y',
}) => {
  const [rangeMode, setRangeMode] = useState<'1y' | 'all'>(defaultRange);

  const dateMap = useMemo(() => {
    const map = new Map<string, WorkoutSession[]>();
    sessions.forEach((s) => {
      if (!map.has(s.workoutDate)) {
        map.set(s.workoutDate, []);
      }
      map.get(s.workoutDate)!.push(s);
    });
    return map;
  }, [sessions]);

  const { weeks } = useMemo(() => {
    if (sessions.length === 0) {
      return { weeks: [] };
    }

    const allDates = sessions.map((s) => dayjs(s.workoutDate));
    const maxSessionDate = allDates.reduce((max, d) => (d.isAfter(max) ? d : max), allDates[0]);
    const minSessionDate = allDates.reduce((min, d) => (d.isBefore(min) ? d : min), allDates[0]);

    const end = maxSessionDate;
    const start = rangeMode === '1y' ? end.subtract(52, 'week').startOf('week') : minSessionDate.startOf('week');

    const weeksArr: Array<Array<{ date: dayjs.Dayjs; dateStr: string; sessions: WorkoutSession[] }>> = [];
    let curr = start;

    while (curr.isBefore(end) || curr.isSame(end, 'day')) {
      const week: Array<{ date: dayjs.Dayjs; dateStr: string; sessions: WorkoutSession[] }> = [];
      for (let day = 0; day < 7; day++) {
        const dateStr = curr.format('YYYY-MM-DD');
        week.push({
          date: curr,
          dateStr,
          sessions: dateMap.get(dateStr) || [],
        });
        curr = curr.add(1, 'day');
      }
      weeksArr.push(week);
    }

    return { weeks: weeksArr };
  }, [sessions, dateMap, rangeMode]);

  const activeDaysCount = useMemo(() => {
    let count = 0;
    weeks.forEach((week) => {
      week.forEach((day) => {
        if (day.sessions.length > 0) count++;
      });
    });
    return count;
  }, [weeks]);

  const getCellColor = (sess: WorkoutSession[]) => {
    if (sess.length === 0) return '#1f1f1f';
    if (sess.length === 1) {
      const vol = sess[0].totalVolumeKg;
      if (vol > 15000) return '#52c41a';
      if (vol > 8000) return '#73d13d';
      return '#95de64';
    }
    return '#389e0d';
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FireFilled style={{ color: '#52c41a' }} />
            {title}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {activeDaysCount} active days in {weeks.length} weeks
            </Text>
            <Segmented
              size="small"
              value={rangeMode}
              onChange={(val) => setRangeMode(val as '1y' | 'all')}
              options={[
                { label: 'Past Year', value: '1y' },
                { label: 'All History', value: 'all' },
              ]}
            />
          </div>
        </div>
      }
      style={{ backgroundColor: '#141414', borderColor: '#303030' }}
    >
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{ display: 'flex', gap: 4, minWidth: weeks.length * 15 + 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginRight: 6, paddingTop: 20 }}>
            {dayLabels.map((lbl, idx) => (
              <div
                key={lbl}
                style={{
                  height: 12,
                  fontSize: 10,
                  color: idx % 2 === 1 ? '#8c8c8c' : 'transparent',
                  lineHeight: '12px',
                }}
              >
                {lbl}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 3 }}>
            {weeks.map((week, wIdx) => {
              const firstDay = week[0].date;
              const isFirstWeekOfMonth = firstDay.date() <= 7;
              const monthLabel = isFirstWeekOfMonth ? firstDay.format('MMM') : '';

              return (
                <div key={wIdx} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div style={{ height: 16, fontSize: 10, color: '#8c8c8c', textAlign: 'center' }}>
                    {monthLabel}
                  </div>
                  {week.map((day) => {
                    const hasWorkout = day.sessions.length > 0;
                    const tooltipContent = hasWorkout ? (
                      <div style={{ fontSize: 12, maxWidth: 220 }}>
                        <div style={{ fontWeight: 600, color: '#52c41a' }}>
                          {day.date.format('ddd, D MMM YYYY')}
                        </div>
                        {day.sessions.map((s, sIdx) => (
                          <div key={sIdx} style={{ marginTop: 4, borderTop: sIdx > 0 ? '1px solid #434343' : undefined, paddingTop: sIdx > 0 ? 4 : 0 }}>
                            <div style={{ fontWeight: 500 }}>{s.title}</div>
                            <div style={{ color: '#bfbfbf', fontSize: 11 }}>
                              ⏱️ {s.durationMinutes} mins &nbsp;|&nbsp; 🏋️ {Math.round(s.totalVolumeKg)} kg &nbsp;|&nbsp; 📊 {s.sets.length} sets
                            </div>
                            <div style={{ color: '#8c8c8c', fontSize: 10, marginTop: 2 }}>
                              {s.exercises.slice(0, 3).join(', ')}
                              {s.exercises.length > 3 ? ` +${s.exercises.length - 3} more` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12 }}>
                        {day.date.format('ddd, D MMM YYYY')}: No workout
                      </div>
                    );

                    return (
                      <Tooltip key={day.dateStr} title={tooltipContent} placement="top">
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: 2,
                            backgroundColor: getCellColor(day.sessions),
                            border: day.sessions.length > 0 ? '1px solid rgba(82, 196, 26, 0.4)' : '1px solid #262626',
                            cursor: 'pointer',
                            transition: 'transform 0.1s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.3)')}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        />
                      </Tooltip>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 12, fontSize: 11, color: '#8c8c8c' }}>
          <span>Less</span>
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#1f1f1f', border: '1px solid #262626' }} />
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#95de64' }} />
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#73d13d' }} />
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#52c41a' }} />
          <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#389e0d' }} />
          <span>More</span>
        </div>
      </div>
    </Card>
  );
};
