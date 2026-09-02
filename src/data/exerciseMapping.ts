export type MuscleGroup = 'Back' | 'Legs' | 'Chest' | 'Arms' | 'Shoulders' | 'Core';

export const MUSCLE_GROUPS: MuscleGroup[] = ['Back', 'Legs', 'Chest', 'Arms', 'Shoulders', 'Core'];

export type MuscleWeightMap = Partial<Record<MuscleGroup, number>>;

/**
 * Biomechanical muscle contribution weights:
 * - Primary Target: 1.0 (100%)
 * - Secondary Synergist: 0.5 (50%)
 * - Tertiary / Stabilizer: 0.2 - 0.4 (20% - 40%)
 * - Pure Isolation: 1.0 to target muscle
 */
export const EXERCISE_MUSCLE_WEIGHTS: Record<string, MuscleWeightMap> = {
  'Arnold Press (Dumbbell)': { Shoulders: 1.0, Arms: 0.5 },
  'Around The World': { Chest: 1.0, Shoulders: 0.5 },
  'Back Extension (Weighted Hyperextension)': { Back: 1.0, Legs: 0.5 },
  'Behind the Back Bicep Wrist Curl (Barbell)': { Arms: 1.0 },
  'Bench Press (Barbell)': { Chest: 1.0, Shoulders: 0.5, Arms: 0.5 },
  'Bench Press (Dumbbell)': { Chest: 1.0, Shoulders: 0.5, Arms: 0.5 },
  'Bench Press (Smith Machine)': { Chest: 1.0, Shoulders: 0.5, Arms: 0.5 },
  'Bench Press - Close Grip (Barbell)': { Arms: 1.0, Chest: 0.5, Shoulders: 0.3 },
  'Bench Press - Wide Grip (Barbell)': { Chest: 1.0, Shoulders: 0.5 },
  'Bent over fly': { Shoulders: 1.0, Back: 0.5 },
  'Bent Over Row (Barbell)': { Back: 1.0, Arms: 0.5, Core: 0.2 },
  'Bicep Curl (Barbell)': { Arms: 1.0 },
  'Bicep Curl (Cable)': { Arms: 1.0 },
  'Bicep Curl (Dumbbell)': { Arms: 1.0 },
  'Bulgarian Split Squat': { Legs: 1.0, Core: 0.2 },
  'Cable Crunch': { Core: 1.0 },
  'Calf Press (Machine)': { Legs: 1.0 },
  'Chest Dip': { Chest: 1.0, Arms: 0.5, Shoulders: 0.4 },
  'Chest Dip (Assisted)': { Chest: 1.0, Arms: 0.5, Shoulders: 0.4 },
  'Chest Dip (Weighted)': { Chest: 1.0, Arms: 0.5, Shoulders: 0.4 },
  'Chest Fly (Machine)': { Chest: 1.0 },
  'Chest Press (Machine)': { Chest: 1.0, Shoulders: 0.5, Arms: 0.5 },
  'Chest Supported Incline Row (Dumbbell)': { Back: 1.0, Arms: 0.5 },
  'Chest-Supported Incline Row (dumbbell)': { Back: 1.0, Arms: 0.5 },
  'Chin Up': { Back: 1.0, Arms: 0.6 },
  'Clean Pull': { Back: 1.0, Legs: 0.5 },
  'Clean and Jerk': { Legs: 1.0, Back: 0.5, Shoulders: 0.5, Arms: 0.3 },
  'Climbing': { Back: 1.0, Arms: 0.8, Core: 0.3 },
  'Concentration Curl': { Arms: 1.0 },
  'Dead Hang': { Back: 1.0, Arms: 0.5 },
  'Deadlift (Band)': { Back: 1.0, Legs: 0.5, Core: 0.2 },
  'Deadlift (Barbell)': { Back: 1.0, Legs: 0.5, Core: 0.2 },
  'Deadlift (Dumbbell)': { Back: 1.0, Legs: 0.5, Core: 0.2 },
  'Deadlift (Trap bar)': { Legs: 1.0, Back: 0.6, Core: 0.2 },
  'Decline Bench Press (Dumbbell)': { Chest: 1.0, Arms: 0.5 },
  'Decline Bench Press (Machine)': { Chest: 1.0, Arms: 0.5 },
  'Decline Crunch': { Core: 1.0 },
  'Decline Crunch (Weighted)': { Core: 1.0 },
  'Decline Push Up': { Chest: 1.0, Shoulders: 0.5, Arms: 0.5, Core: 0.2 },
  'Diamond Push Up': { Arms: 1.0, Chest: 0.5 },
  'Dumbbell Row': { Back: 1.0, Arms: 0.5 },
  'Dumbbell Skullcrusher': { Arms: 1.0 },
  'Face Pull': { Shoulders: 1.0, Back: 0.5 },
  'Farmer\'s Walk': { Arms: 1.0, Back: 0.5, Core: 0.4 },
  'Fire Hydrants': { Legs: 1.0 },
  'Floor Press (Barbell)': { Chest: 1.0, Arms: 0.5, Shoulders: 0.4 },
  'Flutter Kicks': { Core: 1.0 },
  'Frog Jumps': { Legs: 1.0 },
  'Front Lever Raise': { Core: 1.0, Back: 0.6 },
  'Front Squat': { Legs: 1.0, Core: 0.4, Back: 0.3 },
  'Glute Bridge': { Legs: 1.0 },
  'Glute Ham Raise': { Legs: 1.0, Back: 0.4 },
  'Glute Kickback (Machine)': { Legs: 1.0 },
  'Glute Kickback on Floor': { Legs: 1.0 },
  'Goblet Squat': { Legs: 1.0, Core: 0.3 },
  'Good Morning (Barbell)': { Legs: 1.0, Back: 0.6, Core: 0.3 },
  'Hack Squat': { Legs: 1.0 },
  'Hack Squat (Machine)': { Legs: 1.0 },
  'Hammer Curl (Band)': { Arms: 1.0 },
  'Hammer Curl (Cable)': { Arms: 1.0 },
  'Hammer Curl (Dumbbell)': { Arms: 1.0 },
  'Handstand Push Up': { Shoulders: 1.0, Arms: 0.5, Core: 0.3 },
  'Hang Snatch': { Legs: 1.0, Back: 0.5, Shoulders: 0.5 },
  'Heel Taps': { Core: 1.0 },
  'Hip Abduction (Machine)': { Legs: 1.0 },
  'Hip Adduction (Machine)': { Legs: 1.0 },
  'Hip Thrust': { Legs: 1.0 },
  'Hip Thrust (Barbell)': { Legs: 1.0 },
  'Hip Thrust (Machine)': { Legs: 1.0 },
  'Hollow Rock Hold': { Core: 1.0 },
  'Incline Bench Press (Barbell)': { Chest: 1.0, Shoulders: 0.5, Arms: 0.5 },
  'Incline Bench Press (Dumbbell)': { Chest: 1.0, Shoulders: 0.5, Arms: 0.5 },
  'Incline Bench Press (Smith Machine)': { Chest: 1.0, Shoulders: 0.5, Arms: 0.5 },
  'Incline Chest Fly (Dumbbell)': { Chest: 1.0 },
  'Incline Chest Press (Machine)': { Chest: 1.0, Shoulders: 0.5, Arms: 0.5 },
  'Incline Push Ups': { Chest: 1.0, Arms: 0.5 },
  'Iso-Lateral Low Row': { Back: 1.0, Arms: 0.5 },
  'Jackknife Sit Up': { Core: 1.0 },
  'Jump Squat': { Legs: 1.0 },
  'Kettlebell Goblet Squat': { Legs: 1.0, Core: 0.3 },
  'Kettlebell Turkish Get Up': { Core: 1.0, Shoulders: 0.6, Legs: 0.5, Arms: 0.4 },
  'Kipping Pull Up': { Back: 1.0, Arms: 0.5, Core: 0.3 },
  'Knee Raise Parallel Bars': { Core: 1.0 },
  'Lat Pulldown (Cable)': { Back: 1.0, Arms: 0.5 },
  'Lat Pulldown (Machine)': { Back: 1.0, Arms: 0.5 },
  'Lat Pulldown (band)': { Back: 1.0, Arms: 0.5 },
  'Lat Pulldown - Close Grip (Cable)': { Back: 1.0, Arms: 0.6 },
  'Lateral Leg Raises': { Legs: 1.0 },
  'Lateral Raise (Cable)': { Shoulders: 1.0 },
  'Lateral Raise (Dumbbell)': { Shoulders: 1.0 },
  'Lateral Raise (Machine)': { Shoulders: 1.0 },
  'Lateral Squat': { Legs: 1.0 },
  'Leg Extension (Machine)': { Legs: 1.0 },
  'Leg Press (Machine)': { Legs: 1.0 },
  'Leg Press Horizontal (Machine)': { Legs: 1.0 },
  'Leg Raise Parallel Bars': { Core: 1.0 },
  'Lunge (Barbell)': { Legs: 1.0, Core: 0.3 },
  'Lunge (Dumbbell)': { Legs: 1.0, Core: 0.3 },
  'Lying Knee Raise': { Core: 1.0 },
  'Lying Leg Curl (Machine)': { Legs: 1.0 },
  'Meadows Row': { Back: 1.0, Arms: 0.5 },
  'Muscle Up': { Back: 1.0, Arms: 0.6, Chest: 0.5, Core: 0.3 },
  'Oblique Crunch': { Core: 1.0 },
  'One-Arm Push-Up': { Chest: 1.0, Arms: 0.5, Core: 0.3 },
  'One-Arm Tricep Extension (Dumbbell)': { Arms: 1.0 },
  'Overhead Press (Smith Machine)': { Shoulders: 1.0, Arms: 0.5 },
  'Overhead Squat': { Legs: 1.0, Shoulders: 0.6, Core: 0.4, Back: 0.3 },
  'Overhead Triceps Extension (Cable)': { Arms: 1.0 },
  'Pendlay Row': { Back: 1.0, Arms: 0.5, Core: 0.3 },
  'Pendulum Squat (Machine)': { Legs: 1.0 },
  'Pinwheel Curl (Dumbbell)': { Arms: 1.0 },
  'Plank': { Core: 1.0 },
  'Plate Curls': { Arms: 1.0 },
  'Plate Front Raise': { Shoulders: 1.0 },
  'Plate Press': { Chest: 1.0, Arms: 0.5 },
  'Preacher Curl (Barbell)': { Arms: 1.0 },
  'Preacher Curl (Dumbbell)': { Arms: 1.0 },
  'Preacher Curl (Machine)': { Arms: 1.0 },
  'Pull Up': { Back: 1.0, Arms: 0.5, Core: 0.2 },
  'Pull Up (Assisted)': { Back: 1.0, Arms: 0.5 },
  'Pullover (Dumbbell)': { Chest: 1.0, Back: 0.6 },
  'Push Press': { Shoulders: 1.0, Legs: 0.5, Arms: 0.5 },
  'Push Up': { Chest: 1.0, Arms: 0.5, Shoulders: 0.4, Core: 0.2 },
  'Push Up (Weighted)': { Chest: 1.0, Arms: 0.5, Shoulders: 0.4, Core: 0.2 },
  'Rack Pull': { Back: 1.0, Legs: 0.5 },
  'Rear Delt Reverse Fly (Machine)': { Shoulders: 1.0, Back: 0.4 },
  'Renegade Row': { Back: 1.0, Core: 0.5, Arms: 0.4 },
  'Reverse Curl': { Arms: 1.0 },
  'Reverse Lunge': { Legs: 1.0, Core: 0.2 },
  'Reverse Plank': { Core: 1.0 },
  'Ring Dips': { Chest: 1.0, Arms: 0.6, Shoulders: 0.5, Core: 0.3 },
  'Romanian Deadlift (Barbell)': { Legs: 1.0, Back: 0.5, Core: 0.2 },
  'Romanian Deadlift (Dumbbell)': { Legs: 1.0, Back: 0.5, Core: 0.2 },
  'Russian Twist (Bodyweight)': { Core: 1.0 },
  'Russian Twist (weighted)': { Core: 1.0 },
  'Scapular Pull-ups': { Back: 1.0 },
  'Seated Cable Row - Bar Grip': { Back: 1.0, Arms: 0.5 },
  'Seated Cable Row - Bar Wide Grip': { Back: 1.0, Arms: 0.5 },
  'Seated Cable Row - V Grip (Cable)': { Back: 1.0, Arms: 0.5 },
  'Seated Calf Raise': { Legs: 1.0 },
  'Seated Calf Raises': { Legs: 1.0 },
  'Seated Leg Curl (Machine)': { Legs: 1.0 },
  'Seated Overhead Press (Barbell)': { Shoulders: 1.0, Arms: 0.5 },
  'Seated Shoulder Press (Machine)': { Shoulders: 1.0, Arms: 0.5 },
  'Shoulder Press (Dumbbell)': { Shoulders: 1.0, Arms: 0.5 },
  'Shoulder Press (Machine Plates)': { Shoulders: 1.0, Arms: 0.5 },
  'Shrug (Barbell)': { Back: 1.0, Shoulders: 0.3 },
  'Shrug (Dumbbell)': { Back: 1.0, Shoulders: 0.3 },
  'Side Bend (Dumbbell)': { Core: 1.0 },
  'Single Arm Cable Row': { Back: 1.0, Arms: 0.5 },
  'Single Arm Curl (Cable)': { Arms: 1.0 },
  'Single Arm Lat Pulldown': { Back: 1.0, Arms: 0.5 },
  'Single Arm Lateral Raise (Cable)': { Shoulders: 1.0 },
  'Single Leg Glute Bridge': { Legs: 1.0 },
  'Single Leg Hip Thrust': { Legs: 1.0 },
  'Single Leg Press (Machine)': { Legs: 1.0 },
  'Single Leg Romanian Deadlift (Dumbbell)': { Legs: 1.0, Back: 0.5 },
  'Single Leg Standing Calf Raise': { Legs: 1.0 },
  'Sissy Squat': { Legs: 1.0 },
  'Sit Ups': { Core: 1.0 },
  'Skullcrusher (barbell)': { Arms: 1.0 },
  'Spider Curl (Dumbbell)': { Arms: 1.0 },
  'Spiderman': { Core: 1.0 },
  'Split Squat (Dumbbell)': { Legs: 1.0, Core: 0.2 },
  'Squat (Barbell)': { Legs: 1.0, Core: 0.3, Back: 0.2 },
  'Squat (Bodyweight)': { Legs: 1.0, Core: 0.2 },
  'Squat (Machine)': { Legs: 1.0, Core: 0.2 },
  'Squat (Smith Machine)': { Legs: 1.0, Core: 0.2 },
  'Stair Machine (Steps)': { Legs: 1.0 },
  'Standing Calf Raise (Machine)': { Legs: 1.0 },
  'Standing Leg Curls': { Legs: 1.0 },
  'Standing Military Press (Barbell)': { Shoulders: 1.0, Arms: 0.5, Core: 0.2 },
  'Sternum Pull up (Gironda)': { Back: 1.0, Arms: 0.5 },
  'Stiff / straight leg deadlift': { Legs: 1.0, Back: 0.5, Core: 0.2 },
  'Sumo Deadlift': { Legs: 1.0, Back: 0.6, Core: 0.2 },
  'Sumo Squat (barbell)': { Legs: 1.0, Core: 0.3 },
  'Superman': { Back: 1.0, Core: 0.5 },
  'T Bar Row': { Back: 1.0, Arms: 0.5 },
  'Thruster (Kettlebell)': { Legs: 1.0, Shoulders: 0.6, Arms: 0.4 },
  'Triceps Dip (Weighted)': { Arms: 1.0, Chest: 0.5, Shoulders: 0.3 },
  'Triceps Extension (Cable)': { Arms: 1.0 },
  'Triceps Extension (Dumbbell)': { Arms: 1.0 },
  'Triceps Extension (Suspension)': { Arms: 1.0 },
  'Triceps Extension (barbell)': { Arms: 1.0 },
  'Triceps Kickback': { Arms: 1.0 },
  'Triceps Pushdown': { Arms: 1.0 },
  'Triceps Rope Pushdown': { Arms: 1.0 },
  'Upright Row (Barbell)': { Shoulders: 1.0, Arms: 0.5, Back: 0.3 },
  'V Up': { Core: 1.0 },
  'Walking': { Legs: 1.0 },
  'Wall Sit': { Legs: 1.0 },
  'Zercher Squat': { Legs: 1.0, Core: 0.4, Back: 0.3, Arms: 0.3 },
  'Zottman Curl (Dumbbell)': { Arms: 1.0 },
  'painting': { Arms: 1.0, Shoulders: 0.3 },
};

/**
 * Derives muscle group arrays sorted by descending contribution weight
 * for backwards compatibility with badges, filters, and tables.
 */
export const EXERCISE_MUSCLE_MAPPING: Record<string, MuscleGroup[]> = Object.fromEntries(
  Object.entries(EXERCISE_MUSCLE_WEIGHTS).map(([title, weights]) => [
    title,
    (Object.entries(weights) as [MuscleGroup, number][])
      .sort((a, b) => b[1] - a[1])
      .map(([mg]) => mg),
  ])
);

export const exerciseMuscleMapping = EXERCISE_MUSCLE_MAPPING;
export default EXERCISE_MUSCLE_MAPPING;

/**
 * Returns muscle weights map for a given exercise title.
 * Uses dictionary lookup with case-insensitive fallback and keyword heuristics.
 */
export function getMuscleWeightsForExercise(title: string): MuscleWeightMap {
  if (!title) return { Core: 1.0 };
  const trimmed = title.trim();

  if (EXERCISE_MUSCLE_WEIGHTS[trimmed]) {
    return EXERCISE_MUSCLE_WEIGHTS[trimmed];
  }

  const lower = trimmed.toLowerCase();
  for (const [key, weights] of Object.entries(EXERCISE_MUSCLE_WEIGHTS)) {
    if (key.toLowerCase() === lower) {
      return weights;
    }
  }

  // Fallback heuristics
  if (lower.includes('bench') || lower.includes('chest') || lower.includes('push up')) {
    return { Chest: 1.0, Shoulders: 0.5, Arms: 0.5 };
  }
  if (lower.includes('fly')) {
    return { Chest: 1.0 };
  }
  if (lower.includes('squat') || lower.includes('lunge') || lower.includes('leg press')) {
    return { Legs: 1.0, Core: 0.3 };
  }
  if (lower.includes('calf') || lower.includes('leg curl') || lower.includes('leg extension')) {
    return { Legs: 1.0 };
  }
  if (lower.includes('deadlift')) {
    return { Back: 1.0, Legs: 0.5, Core: 0.2 };
  }
  if (lower.includes('row') || lower.includes('pulldown') || lower.includes('pull up') || lower.includes('chin')) {
    return { Back: 1.0, Arms: 0.5 };
  }
  if (lower.includes('press') || lower.includes('raise') || lower.includes('delt')) {
    return { Shoulders: 1.0, Arms: 0.5 };
  }
  if (lower.includes('curl') || lower.includes('tricep') || lower.includes('skullcrusher') || lower.includes('pushdown')) {
    return { Arms: 1.0 };
  }
  if (lower.includes('crunch') || lower.includes('plank') || lower.includes('ab') || lower.includes('sit up')) {
    return { Core: 1.0 };
  }

  return { Core: 1.0 };
}

/**
 * Returns muscle groups for a given exercise title (ordered by primary mover first).
 */
export function getMuscleGroupsForExercise(title: string): MuscleGroup[] {
  const weights = getMuscleWeightsForExercise(title);
  const groups = (Object.entries(weights) as [MuscleGroup, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([mg]) => mg);

  return groups.length > 0 ? groups : ['Core'];
}
