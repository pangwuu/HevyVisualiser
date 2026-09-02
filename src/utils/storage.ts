import { DEFAULT_WORKOUT_CSV, DEFAULT_MEASUREMENT_CSV } from '../data/defaultData';

const WORKOUT_CSV_KEY = 'hevy_workout_csv_data';
const MEASUREMENT_CSV_KEY = 'hevy_measurement_csv_data';
const WORKOUT_UPLOAD_TIME_KEY = 'hevy_workout_last_upload';
const MEASUREMENT_UPLOAD_TIME_KEY = 'hevy_measurement_last_upload';

export interface StorageInfo {
  workoutCsv: string;
  measurementCsv: string;
  workoutUploadTime: string | null;
  measurementUploadTime: string | null;
  isUsingDefault: boolean;
}

export function loadSavedData(): StorageInfo {
  try {
    const savedWorkout = localStorage.getItem(WORKOUT_CSV_KEY);
    const savedMeasurement = localStorage.getItem(MEASUREMENT_CSV_KEY);
    const workoutTime = localStorage.getItem(WORKOUT_UPLOAD_TIME_KEY);
    const measurementTime = localStorage.getItem(MEASUREMENT_UPLOAD_TIME_KEY);

    const workoutCsv = savedWorkout && savedWorkout.trim().length > 0 ? savedWorkout : DEFAULT_WORKOUT_CSV;
    const measurementCsv = savedMeasurement && savedMeasurement.trim().length > 0 ? savedMeasurement : DEFAULT_MEASUREMENT_CSV;

    return {
      workoutCsv,
      measurementCsv,
      workoutUploadTime: workoutTime,
      measurementUploadTime: measurementTime,
      isUsingDefault: !savedWorkout,
    };
  } catch (err) {
    console.warn('Failed to read from localStorage, using default data:', err);
    return {
      workoutCsv: DEFAULT_WORKOUT_CSV,
      measurementCsv: DEFAULT_MEASUREMENT_CSV,
      workoutUploadTime: null,
      measurementUploadTime: null,
      isUsingDefault: true,
    };
  }
}

export function saveWorkoutCsv(csvText: string): void {
  try {
    localStorage.setItem(WORKOUT_CSV_KEY, csvText);
    localStorage.setItem(WORKOUT_UPLOAD_TIME_KEY, new Date().toISOString());
  } catch (err) {
    console.error('Failed to save workout CSV to localStorage:', err);
  }
}

export function saveMeasurementCsv(csvText: string): void {
  try {
    localStorage.setItem(MEASUREMENT_CSV_KEY, csvText);
    localStorage.setItem(MEASUREMENT_UPLOAD_TIME_KEY, new Date().toISOString());
  } catch (err) {
    console.error('Failed to save measurement CSV to localStorage:', err);
  }
}

export function clearCustomData(): void {
  try {
    localStorage.removeItem(WORKOUT_CSV_KEY);
    localStorage.removeItem(MEASUREMENT_CSV_KEY);
    localStorage.removeItem(WORKOUT_UPLOAD_TIME_KEY);
    localStorage.removeItem(MEASUREMENT_UPLOAD_TIME_KEY);
  } catch (err) {
    console.error('Failed to clear data from localStorage:', err);
  }
}
