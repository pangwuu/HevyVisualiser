import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  filterWorkoutSets,
  calculateStreaks,
  calculateDashboardSummary,
  calculateMuscleDistribution,
  calculateExerciseStats,
  calculatePersonalRecordsTimeline,
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
});
