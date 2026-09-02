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
      muscleWeights: { Chest: 1.0, Shoulders: 0.5, Arms: 0.5 },
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
      muscleWeights: { Chest: 1.0, Shoulders: 0.5, Arms: 0.5 },
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
      muscleWeights: { Back: 1.0, Legs: 0.5, Core: 0.2 },
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
      totalVolumeKg: 880,
      totalSetsCount: 2,
      workingSetsCount: 1,
      exercises: ['Bench Press (Barbell)'],
      muscleGroups: ['Chest', 'Arms', 'Shoulders'],
      sets: [mockSets[0], mockSets[1]],
    },
    {
      id: 's2',
      title: 'Pull Day',
      startTime: dayjs('2026-08-15T10:00:00.000Z').toDate(),
      endTime: dayjs('2026-08-15T11:00:00.000Z').toDate(),
      workoutDate: '2026-08-15',
      durationMinutes: 60,
      totalVolumeKg: 600,
      totalSetsCount: 1,
      workingSetsCount: 1,
      exercises: ['Deadlift (Barbell)'],
      muscleGroups: ['Back', 'Legs', 'Core'],
      sets: [mockSets[2]],
    },
  ];

  describe('filterWorkoutSets', () => {
    it('filters sets within 7 days window', () => {
      const filter: FilterState = {
        timeRange: '7d',
        includeWarmups: true,
      };
      const filtered = filterWorkoutSets(mockSets, filter, refDate);
      expect(filtered.length).toBe(2); // Only 2026-08-30
    });

    it('excludes warmup sets when toggle is off', () => {
      const filter: FilterState = {
        timeRange: 'all',
        includeWarmups: false,
      };
      const filtered = filterWorkoutSets(mockSets, filter, refDate);
      expect(filtered.length).toBe(2); // Excludes set id: 1
      expect(filtered.some((s) => s.setType === 'warmup')).toBe(false);
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
      expect(filtered[0].exerciseTitle).toBe('Deadlift (Barbell)');
    });
  });

  describe('calculateStreaks', () => {
    it('calculates current and longest workout streaks correctly', () => {
      const sessions: WorkoutSession[] = [
        { workoutDate: '2026-08-31' } as any,
        { workoutDate: '2026-08-30' } as any,
        { workoutDate: '2026-08-28' } as any,
      ];
      const { currentStreak, longestStreak } = calculateStreaks(sessions, refDate);
      expect(currentStreak).toBe(2);
      expect(longestStreak).toBe(2);
    });

    it('handles non-consecutive dates accurately', () => {
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
      expect(summary.mostTrainedMuscle).toBe('Chest');
      expect(summary.mostTrainedMuscleSets).toBe(2);
    });
  });

  describe('calculateMuscleDistribution', () => {
    it('credits compound sets proportionally based on biomechanical weights', () => {
      const dist = calculateMuscleDistribution(mockSets);

      // 2 bench sets (1.0 Chest, 0.5 Shoulders, 0.5 Arms) + 1 deadlift (1.0 Back, 0.5 Legs, 0.2 Core)
      expect(dist.setsByMuscle.Chest).toBe(2);
      expect(dist.setsByMuscle.Shoulders).toBe(1);
      expect(dist.setsByMuscle.Arms).toBe(1);
      expect(dist.setsByMuscle.Back).toBe(1);
      expect(dist.setsByMuscle.Legs).toBe(1);
      expect(dist.setsByMuscle.Core).toBe(0);

      expect(dist.volumeByMuscle.Chest).toBe(880);
      expect(dist.volumeByMuscle.Shoulders).toBe(440);
      expect(dist.volumeByMuscle.Arms).toBe(440);
      expect(dist.volumeByMuscle.Back).toBe(600);
      expect(dist.volumeByMuscle.Legs).toBe(300);
      expect(dist.volumeByMuscle.Core).toBe(120);
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
