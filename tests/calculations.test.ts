import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  filterWorkoutSets,
  calculateStreaks,
  calculateDashboardSummary,
  calculateMuscleDistribution,
  calculateExerciseStats,
  calculatePersonalRecordsTimeline,
  calculateLinearRegressionTrendline,
} from '../src/utils/calculations';
import { WorkoutSet, WorkoutSession, FilterState } from '../src/types';

describe('Calculations & Analytics', () => {
  const refDate = dayjs('2026-08-31T22:00:00.000Z');

  const mockSets: WorkoutSet[] = [
    {
      id: '1',
      workoutTitle: 'Push Day',
      startTime: dayjs('2026-08-30T10:00:00.000Z').toDate(),
      endTime: dayjs('2026-08-30T11:00:00.000Z').toDate(),
      workoutDate: '2026-08-30',
      description: '',
      exerciseTitle: 'Bench Press (Barbell)',
      setIndex: 0,
      setType: 'warmup',
      weightKg: 40,
      reps: 10,
      volumeKg: 400,
      estimated1RM: 53.3,
      muscleGroups: ['Chest', 'Arms', 'Shoulders'],
      exerciseNotes: '',
    },
    {
      id: '2',
      workoutTitle: 'Push Day',
      startTime: dayjs('2026-08-30T10:00:00.000Z').toDate(),
      endTime: dayjs('2026-08-30T11:00:00.000Z').toDate(),
      workoutDate: '2026-08-30',
      description: '',
      exerciseTitle: 'Bench Press (Barbell)',
      setIndex: 1,
      setType: 'normal',
      weightKg: 80,
      reps: 6,
      volumeKg: 480,
      estimated1RM: 96,
      muscleGroups: ['Chest', 'Arms', 'Shoulders'],
      exerciseNotes: '',
    },
    {
      id: '3',
      workoutTitle: 'Pull Day',
      startTime: dayjs('2026-08-15T10:00:00.000Z').toDate(),
      endTime: dayjs('2026-08-15T11:00:00.000Z').toDate(),
      workoutDate: '2026-08-15',
      description: '',
      exerciseTitle: 'Deadlift (Barbell)',
      setIndex: 0,
      setType: 'normal',
      weightKg: 120,
      reps: 5,
      volumeKg: 600,
      estimated1RM: 140,
      muscleGroups: ['Back', 'Legs', 'Core'],
      exerciseNotes: '',
    },
  ];

  const mockSessions: WorkoutSession[] = [
    {
      id: 's1',
      title: 'Push Day',
      startTime: dayjs('2026-08-30T10:00:00.000Z').toDate(),
      endTime: dayjs('2026-08-30T11:00:00.000Z').toDate(),
      workoutDate: '2026-08-30',
      durationMinutes: 60,
      sets: [mockSets[0], mockSets[1]],
      totalVolumeKg: 880,
      workingSetsCount: 1,
      totalSetsCount: 2,
      exercises: ['Bench Press (Barbell)'],
      muscleGroups: ['Chest', 'Arms', 'Shoulders'],
    },
    {
      id: 's2',
      title: 'Pull Day',
      startTime: dayjs('2026-08-15T10:00:00.000Z').toDate(),
      endTime: dayjs('2026-08-15T11:00:00.000Z').toDate(),
      workoutDate: '2026-08-15',
      durationMinutes: 60,
      sets: [mockSets[2]],
      totalVolumeKg: 600,
      workingSetsCount: 1,
      totalSetsCount: 1,
      exercises: ['Deadlift (Barbell)'],
      muscleGroups: ['Back', 'Legs', 'Core'],
    },
  ];

  describe('filterWorkoutSets', () => {
    it('filters out warmup sets when includeWarmups is false', () => {
      const filter: FilterState = { timeRange: 'all', includeWarmups: false };
      const filtered = filterWorkoutSets(mockSets, filter, refDate);
      expect(filtered.length).toBe(2);
      expect(filtered.some((s) => s.setType === 'warmup')).toBe(false);
    });

    it('includes warmup sets when includeWarmups is true', () => {
      const filter: FilterState = { timeRange: 'all', includeWarmups: true };
      const filtered = filterWorkoutSets(mockSets, filter, refDate);
      expect(filtered.length).toBe(3);
    });

    it('filters by 7d time range', () => {
      const filter: FilterState = { timeRange: '7d', includeWarmups: true };
      const filtered = filterWorkoutSets(mockSets, filter, refDate);
      expect(filtered.length).toBe(2);
      expect(filtered.every((s) => s.workoutDate === '2026-08-30')).toBe(true);
    });

    it('filters by custom date range', () => {
      const filter: FilterState = {
        timeRange: 'custom',
        customStartDate: '2026-08-10',
        customEndDate: '2026-08-20',
        includeWarmups: true,
      };
      const filtered = filterWorkoutSets(mockSets, filter, refDate);
      expect(filtered.length).toBe(1);
      expect(filtered[0].workoutDate).toBe('2026-08-15');
    });
  });

  describe('calculateStreaks', () => {
    it('calculates longest streak and consecutive day sequences', () => {
      const sessions: WorkoutSession[] = [
        { workoutDate: '2026-08-01' } as any,
        { workoutDate: '2026-08-02' } as any,
        { workoutDate: '2026-08-03' } as any,
        { workoutDate: '2026-08-05' } as any,
      ];
      const { longestStreak } = calculateStreaks(sessions);
      expect(longestStreak).toBe(3);
    });
  });

  describe('calculateDashboardSummary', () => {
    it('aggregates total workouts, hours, volume and favourite exercise', () => {
      const summary = calculateDashboardSummary(mockSets, mockSessions);
      expect(summary.totalWorkouts).toBe(2);
      expect(summary.totalTimeHours).toBe('2.0');
      expect(summary.totalVolumeKg).toBe(1480);
      expect(summary.totalVolumeTonnes).toBe('1.5');
      expect(summary.favouriteExercise).toBe('Bench Press (Barbell)');
    });
  });

  describe('calculateMuscleDistribution', () => {
    it('credits compound sets to all target muscle groups', () => {
      const dist = calculateMuscleDistribution(mockSets);

      expect(dist.setsByMuscle.Chest).toBe(2);
      expect(dist.setsByMuscle.Arms).toBe(2);
      expect(dist.setsByMuscle.Shoulders).toBe(2);
      expect(dist.setsByMuscle.Back).toBe(1);
      expect(dist.setsByMuscle.Legs).toBe(1);
      expect(dist.setsByMuscle.Core).toBe(1);

      expect(dist.volumeByMuscle.Chest).toBe(880);
      expect(dist.volumeByMuscle.Back).toBe(600);
    });
  });

  describe('calculateExerciseStats', () => {
    it('computes max weight, max est 1RM and session count for exercises', () => {
      const stats = calculateExerciseStats(mockSets);
      const bench = stats.find((e) => e.exerciseTitle === 'Bench Press (Barbell)');
      expect(bench).toBeDefined();
      expect(bench?.totalSessions).toBe(1);
      expect(bench?.totalSets).toBe(2);
      expect(bench?.maxWeightKg).toBe(80);
      expect(bench?.maxEstimated1RM).toBe(96);
      expect(bench?.maxRepsPerSet).toBe(10);
      expect(bench?.isBodyweight).toBe(false);
    });

    it('correctly identifies bodyweight exercises with maxRepsPerSet and isBodyweight true', () => {
      const bodyweightSets: WorkoutSet[] = [
        {
          id: 'bw1',
          workoutTitle: 'Core Day',
          startTime: dayjs('2026-08-30T10:00:00.000Z').toDate(),
          endTime: dayjs('2026-08-30T11:00:00.000Z').toDate(),
          workoutDate: '2026-08-30',
          exerciseTitle: 'Leg Raise Parallel Bars',
          setIndex: 1,
          setType: 'normal',
          reps: 15,
          volumeKg: 0,
          muscleGroups: ['Core'],
          description: '',
          exerciseNotes: '',
        },
        {
          id: 'bw2',
          workoutTitle: 'Core Day',
          startTime: dayjs('2026-08-30T10:00:00.000Z').toDate(),
          endTime: dayjs('2026-08-30T11:00:00.000Z').toDate(),
          workoutDate: '2026-08-30',
          exerciseTitle: 'Leg Raise Parallel Bars',
          setIndex: 2,
          setType: 'normal',
          reps: 20,
          volumeKg: 0,
          muscleGroups: ['Core'],
          description: '',
          exerciseNotes: '',
        },
      ];

      const stats = calculateExerciseStats(bodyweightSets);
      const legRaise = stats.find((e) => e.exerciseTitle === 'Leg Raise Parallel Bars');
      expect(legRaise).toBeDefined();
      expect(legRaise?.isBodyweight).toBe(true);
      expect(legRaise?.maxWeightKg).toBe(0);
      expect(legRaise?.maxRepsPerSet).toBe(20);
      expect(legRaise?.totalReps).toBe(35);
    });
  });

  describe('calculatePersonalRecordsTimeline', () => {
    it('tracks sequential PR improvements on exercises', () => {
      const progressiveSets: WorkoutSet[] = [
        {
          id: '1',
          startTime: dayjs('2026-01-01').toDate(),
          workoutDate: '2026-01-01',
          exerciseTitle: 'Bench Press (Barbell)',
          weightKg: 60,
          reps: 5,
          estimated1RM: 70,
          muscleGroups: ['Chest'],
        } as any,
        {
          id: '2',
          startTime: dayjs('2026-02-01').toDate(),
          workoutDate: '2026-02-01',
          exerciseTitle: 'Bench Press (Barbell)',
          weightKg: 70,
          reps: 5,
          estimated1RM: 81.7,
          muscleGroups: ['Chest'],
        } as any,
        {
          id: '3',
          startTime: dayjs('2026-03-01').toDate(),
          workoutDate: '2026-03-01',
          exerciseTitle: 'Bench Press (Barbell)',
          weightKg: 65,
          reps: 5,
          estimated1RM: 75.8,
          muscleGroups: ['Chest'],
        } as any,
      ];

      const prs = calculatePersonalRecordsTimeline(progressiveSets);
      expect(prs.length).toBe(2);
      expect(prs[0].estimated1RM).toBe(81.7);
      expect(prs[1].estimated1RM).toBe(70);
    });
  });

  describe('calculateLinearRegressionTrendline', () => {
    it('returns empty array for empty inputs and single element for 1 element', () => {
      expect(calculateLinearRegressionTrendline([])).toEqual([]);
      expect(calculateLinearRegressionTrendline([80])).toEqual([80]);
    });

    it('accurately computes linear regression slope and values for increasing trend', () => {
      // Points: (0, 60), (1, 70), (2, 80) -> slope = 10, intercept = 60
      const trend = calculateLinearRegressionTrendline([60, 70, 80]);
      expect(trend).toEqual([60, 70, 80]);
    });

    it('accurately computes best-fit line for noisy data points', () => {
      // Points: (0, 100), (1, 105), (2, 102), (3, 110)
      // x = [0, 1, 2, 3], y = [100, 105, 102, 110]
      // sumX = 6, sumY = 417, sumXY = 0 + 105 + 204 + 330 = 639, sumXX = 0 + 1 + 4 + 9 = 14
      // slope = (4 * 639 - 6 * 417) / (4 * 14 - 36) = (2556 - 2502) / 20 = 54 / 20 = 2.7
      // intercept = (417 - 2.7 * 6) / 4 = (417 - 16.2) / 4 = 400.8 / 4 = 100.2
      // trend = [100.2, 102.9, 105.6, 108.3]
      const trend = calculateLinearRegressionTrendline([100, 105, 102, 110]);
      expect(trend).toEqual([100.2, 102.9, 105.6, 108.3]);
    });
  });
});
