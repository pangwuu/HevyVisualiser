import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isoWeek from 'dayjs/plugin/isoWeek';
import {
  WorkoutSet,
  WorkoutSession,
  FilterState,
  MuscleGroup,
  ExerciseStats,
  PersonalRecord,
} from '../types';
import { MUSCLE_GROUPS } from '../data/exerciseMapping';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isoWeek);

/**
 * Filter sets according to current FilterState (time range and warmups)
 */
export function filterWorkoutSets(
  sets: WorkoutSet[],
  filter: FilterState,
  referenceDate = dayjs()
): WorkoutSet[] {
  let result = sets;

  // Filter warmup
  if (!filter.includeWarmups) {
    result = result.filter((s) => s.setType !== 'warmup');
  }

  // Filter time range
  if (filter.timeRange === 'all') {
    return result;
  }

  if (filter.timeRange === 'custom') {
    if (filter.customStartDate) {
      const start = dayjs(filter.customStartDate).startOf('day');
      result = result.filter((s) => dayjs(s.startTime).isSameOrAfter(start));
    }
    if (filter.customEndDate) {
      const end = dayjs(filter.customEndDate).endOf('day');
      result = result.filter((s) => dayjs(s.startTime).isSameOrBefore(end));
    }
    return result;
  }

  let cutoff = referenceDate;
  switch (filter.timeRange) {
    case '7d':
      cutoff = referenceDate.subtract(7, 'day').startOf('day');
      break;
    case '30d':
      cutoff = referenceDate.subtract(30, 'day').startOf('day');
      break;
    case '3m':
      cutoff = referenceDate.subtract(3, 'month').startOf('day');
      break;
    case '1y':
      cutoff = referenceDate.subtract(1, 'year').startOf('day');
      break;
  }

  return result.filter((s) => dayjs(s.startTime).isSameOrAfter(cutoff));
}

/**
 * Filter sessions by time range
 */
export function filterWorkoutSessions(
  sessions: WorkoutSession[],
  filter: FilterState,
  referenceDate = dayjs()
): WorkoutSession[] {
  if (filter.timeRange === 'all') return sessions;

  if (filter.timeRange === 'custom') {
    let res = sessions;
    if (filter.customStartDate) {
      const start = dayjs(filter.customStartDate).startOf('day');
      res = res.filter((s) => dayjs(s.startTime).isSameOrAfter(start));
    }
    if (filter.customEndDate) {
      const end = dayjs(filter.customEndDate).endOf('day');
      res = res.filter((s) => dayjs(s.startTime).isSameOrBefore(end));
    }
    return res;
  }

  let cutoff = referenceDate;
  switch (filter.timeRange) {
    case '7d':
      cutoff = referenceDate.subtract(7, 'day').startOf('day');
      break;
    case '30d':
      cutoff = referenceDate.subtract(30, 'day').startOf('day');
      break;
    case '3m':
      cutoff = referenceDate.subtract(3, 'month').startOf('day');
      break;
    case '1y':
      cutoff = referenceDate.subtract(1, 'year').startOf('day');
      break;
  }

  return sessions.filter((s) => dayjs(s.startTime).isSameOrAfter(cutoff));
}

/**
 * Calculate streaks from session dates
 */
export function calculateStreaks(sessions: WorkoutSession[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (sessions.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Unique workout dates sorted descending
  const dateSet = new Set(sessions.map((s) => s.workoutDate));
  const sortedDates = Array.from(dateSet).sort().reverse(); // newest first

  if (sortedDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

  // Calculate current streak (active if worked out today or yesterday)
  let currentStreak = 0;
  if (sortedDates[0] === today || sortedDates[0] === yesterday) {
    let expected = dayjs(sortedDates[0]);
    for (const dStr of sortedDates) {
      const d = dayjs(dStr);
      if (d.isSame(expected, 'day')) {
        currentStreak++;
        expected = expected.subtract(1, 'day');
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all history
  const ascDates = Array.from(dateSet).sort(); // oldest first
  let longestStreak = 0;
  let running = 0;
  let prevDate: dayjs.Dayjs | null = null;

  for (const dStr of ascDates) {
    const curr = dayjs(dStr);
    if (!prevDate) {
      running = 1;
    } else {
      const diff = curr.diff(prevDate, 'day');
      if (diff === 1) {
        running++;
      } else if (diff > 1) {
        running = 1;
      }
    }
    if (running > longestStreak) longestStreak = running;
    prevDate = curr;
  }

  return {
    currentStreak,
    longestStreak,
  };
}

/**
 * Calculate summary statistics for top cards
 */
export function calculateDashboardSummary(
  filteredSets: WorkoutSet[],
  filteredSessions: WorkoutSession[]
) {
  const totalWorkouts = filteredSessions.length;
  const totalMinutes = filteredSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalTimeHours = (totalMinutes / 60).toFixed(1);
  const avgDurationMinutes = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;

  // Total volume from raw sets (no duplicate counting)
  const totalVolumeKg = filteredSets.reduce((sum, s) => sum + s.volumeKg, 0);
  const totalVolumeTonnes = (totalVolumeKg / 1000).toFixed(1);

  const totalSets = filteredSets.length;
  const totalReps = filteredSets.reduce((sum, s) => sum + (s.reps || 0), 0);

  // Muscle group set counts
  const muscleSetCounts: Record<MuscleGroup, number> = {
    Back: 0,
    Legs: 0,
    Chest: 0,
    Arms: 0,
    Shoulders: 0,
    Core: 0,
  };

  filteredSets.forEach((s) => {
    s.muscleGroups.forEach((mg) => {
      muscleSetCounts[mg] = (muscleSetCounts[mg] || 0) + 1;
    });
  });

  let mostTrainedMuscle: MuscleGroup = 'Chest';
  let maxMuscleSets = 0;
  Object.entries(muscleSetCounts).forEach(([muscle, count]) => {
    if (count > maxMuscleSets) {
      maxMuscleSets = count;
      mostTrainedMuscle = muscle as MuscleGroup;
    }
  });

  // Exercise frequency
  const exerciseCounts: Record<string, number> = {};
  filteredSets.forEach((s) => {
    exerciseCounts[s.exerciseTitle] = (exerciseCounts[s.exerciseTitle] || 0) + 1;
  });

  let favouriteExercise = 'None';
  let maxExSets = 0;
  Object.entries(exerciseCounts).forEach(([title, count]) => {
    if (count > maxExSets && title !== 'painting' && title !== 'Walking') {
      maxExSets = count;
      favouriteExercise = title;
    }
  });

  return {
    totalWorkouts,
    totalTimeHours,
    avgDurationMinutes,
    totalVolumeKg,
    totalVolumeTonnes,
    totalSets,
    totalReps,
    mostTrainedMuscle: maxMuscleSets > 0 ? mostTrainedMuscle : 'None',
    mostTrainedMuscleSets: maxMuscleSets,
    favouriteExercise,
    favouriteExerciseSets: maxExSets,
  };
}

/**
 * Calculate muscle distributions for radar and bar charts
 */
export function calculateMuscleDistribution(filteredSets: WorkoutSet[]) {
  const setsByMuscle: Record<MuscleGroup, number> = {
    Back: 0,
    Legs: 0,
    Chest: 0,
    Arms: 0,
    Shoulders: 0,
    Core: 0,
  };

  const volumeByMuscle: Record<MuscleGroup, number> = {
    Back: 0,
    Legs: 0,
    Chest: 0,
    Arms: 0,
    Shoulders: 0,
    Core: 0,
  };

  filteredSets.forEach((s) => {
    s.muscleGroups.forEach((mg) => {
      setsByMuscle[mg] = (setsByMuscle[mg] || 0) + 1;
      volumeByMuscle[mg] = (volumeByMuscle[mg] || 0) + s.volumeKg;
    });
  });

  return {
    muscleGroups: MUSCLE_GROUPS,
    setsData: MUSCLE_GROUPS.map((mg) => setsByMuscle[mg]),
    volumeData: MUSCLE_GROUPS.map((mg) => Math.round(volumeByMuscle[mg])),
    setsByMuscle,
    volumeByMuscle,
  };
}

/**
 * Exercise summary stats for table & selector
 */
export function calculateExerciseStats(filteredSets: WorkoutSet[]): ExerciseStats[] {
  const map = new Map<string, {
    muscleGroups: MuscleGroup[];
    sessionDates: Set<string>;
    totalSets: number;
    totalReps: number;
    totalVolumeKg: number;
    maxWeightKg: number;
    maxEstimated1RM: number;
    dates: string[];
  }>();

  filteredSets.forEach((s) => {
    if (!map.has(s.exerciseTitle)) {
      map.set(s.exerciseTitle, {
        muscleGroups: s.muscleGroups,
        sessionDates: new Set(),
        totalSets: 0,
        totalReps: 0,
        totalVolumeKg: 0,
        maxWeightKg: 0,
        maxEstimated1RM: 0,
        dates: [],
      });
    }

    const entry = map.get(s.exerciseTitle)!;
    entry.sessionDates.add(s.workoutDate);
    entry.totalSets += 1;
    entry.totalReps += s.reps || 0;
    entry.totalVolumeKg += s.volumeKg;
    entry.dates.push(s.workoutDate);

    if (s.weightKg && s.weightKg > entry.maxWeightKg) {
      entry.maxWeightKg = s.weightKg;
    }
    if (s.estimated1RM && s.estimated1RM > entry.maxEstimated1RM) {
      entry.maxEstimated1RM = s.estimated1RM;
    }
  });

  const list: ExerciseStats[] = [];
  map.forEach((val, title) => {
    val.dates.sort();
    list.push({
      exerciseTitle: title,
      muscleGroups: val.muscleGroups,
      totalSessions: val.sessionDates.size,
      totalSets: val.totalSets,
      totalReps: val.totalReps,
      totalVolumeKg: Math.round(val.totalVolumeKg),
      maxWeightKg: val.maxWeightKg,
      maxEstimated1RM: val.maxEstimated1RM,
      firstDate: val.dates[0] || '',
      lastDate: val.dates[val.dates.length - 1] || '',
    });
  });

  // Sort by total sessions descending
  return list.sort((a, b) => b.totalSessions - a.totalSessions);
}

/**
 * Group volume by week for weekly trend chart
 */
export function calculateWeeklyVolumeTrend(sessions: WorkoutSession[]): {
  weeks: string[];
  volumes: number[];
  workoutsCount: number[];
} {
  const weekMap = new Map<string, { volume: number; count: number }>();

  sessions.forEach((s) => {
    const weekKey = dayjs(s.startTime).startOf('isoWeek').format('YYYY-MM-DD');
    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, { volume: 0, count: 0 });
    }
    const curr = weekMap.get(weekKey)!;
    curr.volume += s.totalVolumeKg;
    curr.count += 1;
  });

  const sortedWeeks = Array.from(weekMap.keys()).sort();
  return {
    weeks: sortedWeeks.map((w) => dayjs(w).format('DD MMM YY')),
    volumes: sortedWeeks.map((w) => Math.round(weekMap.get(w)!.volume)),
    workoutsCount: sortedWeeks.map((w) => weekMap.get(w)!.count),
  };
}

/**
 * Calculate personal records history across exercises
 */
export function calculatePersonalRecordsTimeline(sets: WorkoutSet[]): PersonalRecord[] {
  // Sort sets chronologically
  const sorted = [...sets].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  const max1RMByExercise = new Map<string, number>();
  const prs: PersonalRecord[] = [];

  sorted.forEach((set) => {
    if (!set.estimated1RM || set.estimated1RM <= 0 || !set.weightKg || !set.reps) return;
    const prevMax = max1RMByExercise.get(set.exerciseTitle) || 0;

    if (set.estimated1RM > prevMax) {
      max1RMByExercise.set(set.exerciseTitle, set.estimated1RM);
      // Record PR event (only after having at least one baseline if desired, or starting baseline)
      prs.push({
        id: `pr-${set.id}`,
        exerciseTitle: set.exerciseTitle,
        date: set.workoutDate,
        dateTime: set.startTime,
        weightKg: set.weightKg,
        reps: set.reps,
        estimated1RM: set.estimated1RM,
        muscleGroups: set.muscleGroups,
      });
    }
  });

  return prs.sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
}
