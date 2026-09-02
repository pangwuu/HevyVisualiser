import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  WorkoutSet,
  WorkoutSession,
  MeasurementRecord,
  FilterState,
  TimeRangeOption,
  ExerciseStats,
  PersonalRecord,
} from '../types';
import {
  parseWorkoutCsv,
  parseMeasurementCsv,
  groupSetsIntoSessions,
} from '../utils/csvParser';
import {
  filterWorkoutSets,
  filterWorkoutSessions,
  calculateStreaks,
  calculateDashboardSummary,
  calculateMuscleDistribution,
  calculateExerciseStats,
  calculateWeeklyVolumeTrend,
  calculatePersonalRecordsTimeline,
} from '../utils/calculations';
import {
  loadSavedData,
  saveWorkoutCsv,
  saveMeasurementCsv,
  clearCustomData,
} from '../utils/storage';

interface WorkoutDataContextType {
  allSets: WorkoutSet[];
  allSessions: WorkoutSession[];
  measurements: MeasurementRecord[];
  filter: FilterState;
  setTimeRange: (range: TimeRangeOption, customStart?: string, customEnd?: string) => void;
  setIncludeWarmups: (include: boolean) => void;
  filteredSets: WorkoutSet[];
  filteredSessions: WorkoutSession[];
  streaks: { currentStreak: number; longestStreak: number };
  dashboardSummary: ReturnType<typeof calculateDashboardSummary>;
  muscleDistribution: ReturnType<typeof calculateMuscleDistribution>;
  exerciseStats: ExerciseStats[];
  weeklyVolumeTrend: ReturnType<typeof calculateWeeklyVolumeTrend>;
  personalRecords: PersonalRecord[];
  workoutUploadTime: string | null;
  measurementUploadTime: string | null;
  isUsingDefault: boolean;
  uploadWorkout: (csvText: string) => void;
  uploadMeasurement: (csvText: string) => void;
  resetDefaultData: () => void;
}

const WorkoutDataContext = createContext<WorkoutDataContextType | undefined>(undefined);

export const WorkoutDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storageState, setStorageState] = useState(() => loadSavedData());
  const [filter, setFilter] = useState<FilterState>({
    timeRange: 'all',
    includeWarmups: false,
  });

  const allSets = useMemo(() => {
    return parseWorkoutCsv(storageState.workoutCsv);
  }, [storageState.workoutCsv]);

  const allSessions = useMemo(() => {
    return groupSetsIntoSessions(allSets);
  }, [allSets]);

  const measurements = useMemo(() => {
    return parseMeasurementCsv(storageState.measurementCsv);
  }, [storageState.measurementCsv]);

  // If there are sessions, we can use the latest session date as the reference point for relative filters (e.g. 7d, 30d, 1y) if today is far ahead, or today!
  // Since user dataset has dates up to Aug 2026, dayjs() is 2026, which matches perfectly.
  const filteredSets = useMemo(() => {
    return filterWorkoutSets(allSets, filter);
  }, [allSets, filter]);

  const filteredSessions = useMemo(() => {
    return filterWorkoutSessions(allSessions, filter);
  }, [allSessions, filter]);

  const streaks = useMemo(() => {
    return calculateStreaks(allSessions);
  }, [allSessions]);

  const dashboardSummary = useMemo(() => {
    return calculateDashboardSummary(filteredSets, filteredSessions);
  }, [filteredSets, filteredSessions]);

  const muscleDistribution = useMemo(() => {
    return calculateMuscleDistribution(filteredSets);
  }, [filteredSets]);

  const exerciseStats = useMemo(() => {
    return calculateExerciseStats(filteredSets);
  }, [filteredSets]);

  const weeklyVolumeTrend = useMemo(() => {
    return calculateWeeklyVolumeTrend(filteredSessions);
  }, [filteredSessions]);

  const personalRecords = useMemo(() => {
    return calculatePersonalRecordsTimeline(allSets);
  }, [allSets]);

  const setTimeRange = useCallback((range: TimeRangeOption, customStart?: string, customEnd?: string) => {
    setFilter((prev) => ({
      ...prev,
      timeRange: range,
      customStartDate: customStart,
      customEndDate: customEnd,
    }));
  }, []);

  const setIncludeWarmups = useCallback((include: boolean) => {
    setFilter((prev) => ({
      ...prev,
      includeWarmups: include,
    }));
  }, []);

  const uploadWorkout = useCallback((csvText: string) => {
    saveWorkoutCsv(csvText);
    setStorageState(loadSavedData());
  }, []);

  const uploadMeasurement = useCallback((csvText: string) => {
    saveMeasurementCsv(csvText);
    setStorageState(loadSavedData());
  }, []);

  const resetDefaultData = useCallback(() => {
    clearCustomData();
    setStorageState(loadSavedData());
  }, []);

  const value = {
    allSets,
    allSessions,
    measurements,
    filter,
    setTimeRange,
    setIncludeWarmups,
    filteredSets,
    filteredSessions,
    streaks,
    dashboardSummary,
    muscleDistribution,
    exerciseStats,
    weeklyVolumeTrend,
    personalRecords,
    workoutUploadTime: storageState.workoutUploadTime,
    measurementUploadTime: storageState.measurementUploadTime,
    isUsingDefault: storageState.isUsingDefault,
    uploadWorkout,
    uploadMeasurement,
    resetDefaultData,
  };

  return <WorkoutDataContext.Provider value={value}>{children}</WorkoutDataContext.Provider>;
};

export function useWorkoutData(): WorkoutDataContextType {
  const ctx = useContext(WorkoutDataContext);
  if (!ctx) {
    throw new Error('useWorkoutData must be used within a WorkoutDataProvider');
  }
  return ctx;
}
