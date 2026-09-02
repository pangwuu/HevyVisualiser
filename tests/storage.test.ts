import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadSavedData,
  saveWorkoutCsv,
  saveMeasurementCsv,
  clearCustomData,
} from '../src/utils/storage';

describe('Storage Layer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default bundled data when localStorage is empty', () => {
    const data = loadSavedData();
    expect(data.isUsingDefault).toBe(true);
    expect(data.workoutCsv).toContain('exercise_title');
    expect(data.measurementCsv).toContain('weight_kg');
    expect(data.workoutUploadTime).toBeNull();
  });

  it('saves and reloads custom workout CSV with timestamp', () => {
    const customCsv = '"title","start_time","exercise_title"\n"Legs","1 Jan 2026, 10:00","Squat (Barbell)"';
    saveWorkoutCsv(customCsv);

    const data = loadSavedData();
    expect(data.isUsingDefault).toBe(false);
    expect(data.workoutCsv).toBe(customCsv);
    expect(data.workoutUploadTime).not.toBeNull();
  });

  it('saves custom measurement CSV', () => {
    const customMeas = '"date","weight_kg"\n"1 Jan 2026, 00:00",75';
    saveMeasurementCsv(customMeas);

    const data = loadSavedData();
    expect(data.measurementCsv).toBe(customMeas);
    expect(data.measurementUploadTime).not.toBeNull();
  });

  it('clears custom data and restores defaults', () => {
    saveWorkoutCsv('custom data');
    expect(loadSavedData().isUsingDefault).toBe(false);

    clearCustomData();
    expect(loadSavedData().isUsingDefault).toBe(true);
  });
});
