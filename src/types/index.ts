export type MuscleGroup = 'Back' | 'Legs' | 'Chest' | 'Arms' | 'Shoulders' | 'Core';

export type SetType = 'warmup' | 'normal' | 'dropset' | 'failure';

export interface WorkoutSet {
  id: string;
  workoutTitle: string;
  startTime: Date;
  endTime: Date;
  workoutDate: string; // YYYY-MM-DD
  description: string;
  exerciseTitle: string;
  supersetId?: number;
  exerciseNotes: string;
  setIndex: number;
  setType: SetType;
  weightKg?: number;
  reps?: number;
  distanceKm?: number;
  durationSeconds?: number;
  rpe?: number;
  muscleGroups: MuscleGroup[];
  volumeKg: number; // weightKg * reps (0 if undefined)
  estimated1RM?: number; // Epley formula
}

export interface WorkoutSession {
  id: string; // unique startTime string
  title: string;
  startTime: Date;
  endTime: Date;
  workoutDate: string; // YYYY-MM-DD
  durationMinutes: number;
  sets: WorkoutSet[];
  totalVolumeKg: number;
  workingSetsCount: number;
  totalSetsCount: number;
  exercises: string[];
  muscleGroups: MuscleGroup[];
}

export interface MeasurementRecord {
  date: Date;
  dateStr: string; // YYYY-MM-DD
  weightKg?: number;
  fatPercent?: number;
  neckCm?: number;
  shoulderCm?: number;
  chestCm?: number;
  leftBicepCm?: number;
  rightBicepCm?: number;
  leftForearmCm?: number;
  rightForearmCm?: number;
  abdomenCm?: number;
  waistCm?: number;
  hipsCm?: number;
  leftThighCm?: number;
  rightThighCm?: number;
  leftCalfCm?: number;
  rightCalfCm?: number;
}

export type TimeRangeOption = '7d' | '30d' | '3m' | '1y' | 'all' | 'custom';

export interface FilterState {
  timeRange: TimeRangeOption;
  customStartDate?: string; // YYYY-MM-DD
  customEndDate?: string;   // YYYY-MM-DD
  includeWarmups: boolean;
}

export interface ExerciseStats {
  exerciseTitle: string;
  muscleGroups: MuscleGroup[];
  totalSessions: number;
  totalSets: number;
  totalReps: number;
  totalVolumeKg: number;
  maxWeightKg: number;
  maxEstimated1RM: number;
  maxRepsPerSet: number;
  isBodyweight: boolean;
  firstDate: string;
  lastDate: string;
}

export interface PersonalRecord {
  id: string;
  exerciseTitle: string;
  date: string;
  dateTime: Date;
  weightKg: number;
  reps: number;
  estimated1RM: number;
  muscleGroups: MuscleGroup[];
}
