import { describe, it, expect } from 'vitest';
import {
  EXERCISE_MUSCLE_MAPPING,
  MUSCLE_GROUPS,
  getMuscleGroupsForExercise,
} from '../src/data/exerciseMapping';

describe('Exercise Muscle Mapping', () => {
  it('contains valid muscle groups for all mapped exercises', () => {
    const validGroups = new Set(MUSCLE_GROUPS);

    for (const groups of Object.values(EXERCISE_MUSCLE_MAPPING)) {
      expect(groups.length).toBeGreaterThan(0);
      for (const group of groups) {
        expect(validGroups.has(group)).toBe(true);
      }
    }
  });

  it('correctly maps compound exercises to multiple muscle groups', () => {
    // Deadlift -> Back, Legs, Core
    const deadliftGroups = getMuscleGroupsForExercise('Deadlift (Barbell)');
    expect(deadliftGroups).toContain('Back');
    expect(deadliftGroups).toContain('Legs');
    expect(deadliftGroups).toContain('Core');

    // Bench Press -> Chest, Arms, Shoulders
    const benchGroups = getMuscleGroupsForExercise('Bench Press (Barbell)');
    expect(benchGroups).toContain('Chest');
    expect(benchGroups).toContain('Arms');
    expect(benchGroups).toContain('Shoulders');

    // Squat -> Legs, Core, Back
    const squatGroups = getMuscleGroupsForExercise('Squat (Barbell)');
    expect(squatGroups).toContain('Legs');
    expect(squatGroups).toContain('Core');

    // Pull Up -> Back, Arms, Core
    const pullUpGroups = getMuscleGroupsForExercise('Pull Up');
    expect(pullUpGroups).toContain('Back');
    expect(pullUpGroups).toContain('Arms');
  });

  it('maps isolation exercises accurately to single muscle group', () => {
    expect(getMuscleGroupsForExercise('Bicep Curl (Dumbbell)')).toEqual(['Arms']);
    expect(getMuscleGroupsForExercise('Lateral Raise (Cable)')).toEqual(['Shoulders']);
    expect(getMuscleGroupsForExercise('Cable Crunch')).toEqual(['Core']);
    expect(getMuscleGroupsForExercise('Leg Extension (Machine)')).toEqual(['Legs']);
  });

  it('handles unknown / custom exercises with keyword heuristic fallback', () => {
    expect(getMuscleGroupsForExercise('My Custom Incline Bench')).toContain('Chest');
    expect(getMuscleGroupsForExercise('Heavy Leg Extension Variant')).toContain('Legs');
    expect(getMuscleGroupsForExercise('Nonexistent Random Exercise')).toEqual(['Core']);
  });
});
