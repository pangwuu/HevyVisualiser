import Papa from 'papaparse';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { WorkoutSet, WorkoutSession, MeasurementRecord, SetType } from '../types';
import { getMuscleGroupsForExercise, getMuscleWeightsForExercise } from '../data/exerciseMapping';

dayjs.extend(customParseFormat);

export function parseHevyDate(dateStr: string): dayjs.Dayjs {
  if (!dateStr) return dayjs();
  const trimmed = dateStr.trim();
  // Standard Hevy format: '31 Aug 2026, 21:33' or '1 Feb 2024, 00:00'
  const parsed = dayjs(trimmed, 'D MMM YYYY, HH:mm');
  if (parsed.isValid()) return parsed;

  const fallback = dayjs(trimmed);
  return fallback.isValid() ? fallback : dayjs();
}

export function calculateEpley1RM(weightKg?: number, reps?: number): number | undefined {
  if (!weightKg || weightKg <= 0 || !reps || reps <= 0) return undefined;
  if (reps === 1) return weightKg;
  return Number((weightKg * (1 + reps / 30)).toFixed(1));
}

interface RawWorkoutRow {
  title?: string;
  start_time?: string;
  end_time?: string;
  description?: string;
  exercise_title?: string;
  superset_id?: string;
  exercise_notes?: string;
  set_index?: string;
  set_type?: string;
  weight_kg?: string;
  reps?: string;
  distance_km?: string;
  duration_seconds?: string;
  rpe?: string;
}

export function parseWorkoutCsv(csvString: string): WorkoutSet[] {
  if (!csvString || !csvString.trim()) return [];

  const parsed = Papa.parse<RawWorkoutRow>(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  const sets: WorkoutSet[] = [];

  parsed.data.forEach((row, idx) => {
    const exerciseTitle = row.exercise_title?.trim() || 'Unknown Exercise';
    const startDay = parseHevyDate(row.start_time || '');
    const endDay = parseHevyDate(row.end_time || row.start_time || '');

    const rawSetType = (row.set_type || 'normal').toLowerCase();
    let setType: SetType = 'normal';
    if (rawSetType === 'warmup') setType = 'warmup';
    else if (rawSetType === 'dropset') setType = 'dropset';
    else if (rawSetType === 'failure') setType = 'failure';

    const weightKg = row.weight_kg ? parseFloat(row.weight_kg) : undefined;
    const reps = row.reps ? parseInt(row.reps, 10) : undefined;
    const distanceKm = row.distance_km ? parseFloat(row.distance_km) : undefined;
    const durationSeconds = row.duration_seconds ? parseFloat(row.duration_seconds) : undefined;
    const supersetId = row.superset_id && row.superset_id.trim() !== '' ? parseInt(row.superset_id, 10) : undefined;
    const rpe = row.rpe ? parseFloat(row.rpe) : undefined;

    const volumeKg = (weightKg && reps && weightKg > 0 && reps > 0) ? weightKg * reps : 0;
    const estimated1RM = calculateEpley1RM(weightKg, reps);
    const muscleGroups = getMuscleGroupsForExercise(exerciseTitle);
    const muscleWeights = getMuscleWeightsForExercise(exerciseTitle);

    sets.push({
      id: `set-${idx}-${startDay.toISOString()}`,
      workoutTitle: row.title?.trim() || 'Workout',
      startTime: startDay.toDate(),
      endTime: endDay.toDate(),
      workoutDate: startDay.format('YYYY-MM-DD'),
      description: row.description || '',
      exerciseTitle,
      supersetId: isNaN(supersetId as number) ? undefined : supersetId,
      exerciseNotes: row.exercise_notes || '',
      setIndex: row.set_index ? parseInt(row.set_index, 10) : 0,
      setType,
      weightKg: isNaN(weightKg as number) ? undefined : weightKg,
      reps: isNaN(reps as number) ? undefined : reps,
      distanceKm: isNaN(distanceKm as number) ? undefined : distanceKm,
      durationSeconds: isNaN(durationSeconds as number) ? undefined : durationSeconds,
      rpe: isNaN(rpe as number) ? undefined : rpe,
      muscleGroups,
      muscleWeights,
      volumeKg,
      estimated1RM,
    });
  });

  return sets;
}

export function groupSetsIntoSessions(sets: WorkoutSet[]): WorkoutSession[] {
  const sessionMap = new Map<string, WorkoutSet[]>();

  sets.forEach((set) => {
    const sessionKey = `${set.startTime.toISOString()}_${set.workoutTitle}`;
    if (!sessionMap.has(sessionKey)) {
      sessionMap.set(sessionKey, []);
    }
    sessionMap.get(sessionKey)!.push(set);
  });

  const sessions: WorkoutSession[] = [];

  sessionMap.forEach((sessionSets) => {
    if (sessionSets.length === 0) return;
    const firstSet = sessionSets[0];
    const startTime = firstSet.startTime;
    const endTime = sessionSets.reduce((maxEnd, s) => s.endTime > maxEnd ? s.endTime : maxEnd, firstSet.endTime);
    const diffMinutes = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)));

    const exercises = Array.from(new Set(sessionSets.map((s) => s.exerciseTitle)));
    const muscleGroupsSet = new Set<string>();
    sessionSets.forEach((s) => s.muscleGroups.forEach((mg) => muscleGroupsSet.add(mg)));

    const totalVolumeKg = sessionSets.reduce((sum, s) => sum + s.volumeKg, 0);
    const workingSetsCount = sessionSets.filter((s) => s.setType !== 'warmup').length;

    sessions.push({
      id: `${firstSet.startTime.toISOString()}`,
      title: firstSet.workoutTitle,
      startTime,
      endTime,
      workoutDate: firstSet.workoutDate,
      durationMinutes: diffMinutes,
      sets: sessionSets,
      totalVolumeKg,
      workingSetsCount,
      totalSetsCount: sessionSets.length,
      exercises,
      muscleGroups: Array.from(muscleGroupsSet) as any,
    });
  });

  // Sort sessions chronological ascending
  return sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

interface RawMeasurementRow {
  date?: string;
  weight_kg?: string;
  fat_percent?: string;
  neck_cm?: string;
  shoulder_cm?: string;
  chest_cm?: string;
  left_bicep_cm?: string;
  right_bicep_cm?: string;
  left_forearm_cm?: string;
  right_forearm_cm?: string;
  abdomen_cm?: string;
  waist_cm?: string;
  hips_cm?: string;
  left_thigh_cm?: string;
  right_thigh_cm?: string;
  left_calf_cm?: string;
  right_calf_cm?: string;
}

export function parseMeasurementCsv(csvString: string): MeasurementRecord[] {
  if (!csvString || !csvString.trim()) return [];

  const parsed = Papa.parse<RawMeasurementRow>(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  const records: MeasurementRecord[] = [];

  const parseNum = (val?: string) => {
    if (!val || val.trim() === '') return undefined;
    const n = parseFloat(val);
    return isNaN(n) ? undefined : n;
  };

  parsed.data.forEach((row) => {
    if (!row.date) return;
    const day = parseHevyDate(row.date);

    records.push({
      date: day.toDate(),
      dateStr: day.format('YYYY-MM-DD'),
      weightKg: parseNum(row.weight_kg),
      fatPercent: parseNum(row.fat_percent),
      neckCm: parseNum(row.neck_cm),
      shoulderCm: parseNum(row.shoulder_cm),
      chestCm: parseNum(row.chest_cm),
      leftBicepCm: parseNum(row.left_bicep_cm),
      rightBicepCm: parseNum(row.right_bicep_cm),
      leftForearmCm: parseNum(row.left_forearm_cm),
      rightForearmCm: parseNum(row.right_forearm_cm),
      abdomenCm: parseNum(row.abdomen_cm),
      waistCm: parseNum(row.waist_cm),
      hipsCm: parseNum(row.hips_cm),
      leftThighCm: parseNum(row.left_thigh_cm),
      rightThighCm: parseNum(row.right_thigh_cm),
      leftCalfCm: parseNum(row.left_calf_cm),
      rightCalfCm: parseNum(row.right_calf_cm),
    });
  });

  return records.sort((a, b) => a.date.getTime() - b.date.getTime());
}
