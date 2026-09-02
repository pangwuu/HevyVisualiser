import { describe, it, expect } from 'vitest';
import {
  parseWorkoutCsv,
  parseMeasurementCsv,
  groupSetsIntoSessions,
  calculateEpley1RM,
  parseHevyDate,
} from '../src/utils/csvParser';

describe('CSV Parser', () => {
  describe('calculateEpley1RM', () => {
    it('returns undefined for 0 or negative values', () => {
      expect(calculateEpley1RM(0, 10)).toBeUndefined();
      expect(calculateEpley1RM(100, 0)).toBeUndefined();
      expect(calculateEpley1RM(undefined, 5)).toBeUndefined();
    });

    it('returns exact weight for 1 rep', () => {
      expect(calculateEpley1RM(100, 1)).toBe(100);
    });

    it('calculates Epley 1RM formula correctly: weight * (1 + reps/30)', () => {
      // 100 * (1 + 10/30) = 100 * 1.3333 = 133.3
      expect(calculateEpley1RM(100, 10)).toBe(133.3);
      // 50 * (1 + 6/30) = 50 * 1.2 = 60
      expect(calculateEpley1RM(50, 6)).toBe(60);
    });
  });

  describe('parseHevyDate', () => {
    it('parses standard Hevy timestamp string correctly', () => {
      const d = parseHevyDate('31 Aug 2026, 21:33');
      expect(d.isValid()).toBe(true);
      expect(d.year()).toBe(2026);
      expect(d.month()).toBe(7); // August is 7 (0-indexed)
      expect(d.date()).toBe(31);
      expect(d.hour()).toBe(21);
      expect(d.minute()).toBe(33);
    });
  });

  describe('parseWorkoutCsv', () => {
    it('handles empty input gracefully', () => {
      expect(parseWorkoutCsv('')).toEqual([]);
      expect(parseWorkoutCsv('   ')).toEqual([]);
    });

    it('parses workout CSV rows with types, weights, reps, and supersets', () => {
      const sampleCsv = `"title","start_time","end_time","description","exercise_title","superset_id","exercise_notes","set_index","set_type","weight_kg","reps","distance_km","duration_seconds","rpe"
"Push","31 Aug 2026, 21:33","31 Aug 2026, 22:41","","Bench Press (Dumbbell)",,"",0,"warmup",20,6,,,
"Push","31 Aug 2026, 21:33","31 Aug 2026, 22:41","","Bench Press (Dumbbell)",,"",1,"normal",50,6,,,
"Push","31 Aug 2026, 21:33","31 Aug 2026, 22:41","","Triceps Pushdown",1,"note",2,"dropset",20,13,,,`;

      const sets = parseWorkoutCsv(sampleCsv);
      expect(sets.length).toBe(3);

      expect(sets[0].workoutTitle).toBe('Push');
      expect(sets[0].exerciseTitle).toBe('Bench Press (Dumbbell)');
      expect(sets[0].setType).toBe('warmup');
      expect(sets[0].weightKg).toBe(20);
      expect(sets[0].reps).toBe(6);
      expect(sets[0].volumeKg).toBe(120);
      expect(sets[0].muscleGroups).toContain('Chest');
      expect(sets[0].muscleGroups).toContain('Arms');
      expect(sets[0].muscleWeights?.Chest).toBe(1.0);
      expect(sets[0].muscleWeights?.Arms).toBe(0.5);
      expect(sets[0].muscleWeights?.Shoulders).toBe(0.5);

      expect(sets[1].setType).toBe('normal');
      expect(sets[1].weightKg).toBe(50);
      expect(sets[1].estimated1RM).toBe(60);

      expect(sets[2].setType).toBe('dropset');
      expect(sets[2].supersetId).toBe(1);
      expect(sets[2].exerciseNotes).toBe('note');
    });
  });

  describe('groupSetsIntoSessions', () => {
    it('groups sets by start_time into workout sessions', () => {
      const sampleCsv = `"title","start_time","end_time","description","exercise_title","superset_id","exercise_notes","set_index","set_type","weight_kg","reps","distance_km","duration_seconds","rpe"
"Push Session","31 Aug 2026, 21:00","31 Aug 2026, 22:00","","Bench Press (Barbell)",,"",0,"warmup",40,10,,,
"Push Session","31 Aug 2026, 21:00","31 Aug 2026, 22:00","","Bench Press (Barbell)",,"",1,"normal",80,8,,,
"Pull Session","29 Aug 2026, 20:00","29 Aug 2026, 21:00","","Lat Pulldown (Cable)",,"",0,"normal",60,10,,,`;

      const sets = parseWorkoutCsv(sampleCsv);
      const sessions = groupSetsIntoSessions(sets);

      expect(sessions.length).toBe(2);
      expect(sessions[0].title).toBe('Pull Session'); // Chronological ascending
      expect(sessions[1].title).toBe('Push Session');
      expect(sessions[1].sets.length).toBe(2);
      expect(sessions[1].durationMinutes).toBe(60);
      expect(sessions[1].totalVolumeKg).toBe(400 + 640);
      expect(sessions[1].workingSetsCount).toBe(1);
    });
  });

  describe('parseMeasurementCsv', () => {
    it('parses measurement CSV with bodyweight and date', () => {
      const sampleCsv = `"date","weight_kg","fat_percent","neck_cm","shoulder_cm","chest_cm","left_bicep_cm","right_bicep_cm","left_forearm_cm","right_forearm_cm","abdomen_cm","waist_cm","hips_cm","left_thigh_cm","right_thigh_cm","left_calf_cm","right_calf_cm"
"1 Feb 2024, 00:00",69,,,,,,,,,,,,,,,
"4 May 2024, 00:00",70,14.5,,,,,,,,,,,,,,`;

      const measurements = parseMeasurementCsv(sampleCsv);
      expect(measurements.length).toBe(2);
      expect(measurements[0].weightKg).toBe(69);
      expect(measurements[0].dateStr).toBe('2024-02-01');
      expect(measurements[1].weightKg).toBe(70);
      expect(measurements[1].fatPercent).toBe(14.5);
    });
  });
});
