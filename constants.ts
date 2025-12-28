
import { WorkoutFormat, ReadinessLevel, WorkoutSession, Exercise } from './types';

// Conservative base percentages for each format (taken from the middle-low of provided ranges)
export const FORMAT_PERCENTAGES: Record<WorkoutFormat, number> = {
  '4x5': 0.80,   // 75–85%
  '3x5': 0.78,   // 75–82%
  '3x3': 0.84,   // 80–88%
  '1rep': 0.88,  // 85–92%
  'SPEED': 0.65, // 60–70%
};

// Weight adjustments based on daily state
export const READINESS_ADJUSTMENTS: Record<ReadinessLevel, number> = {
  'GOOD': 1.0,
  'MEDIUM': 0.95,
  'POOR': 0.90,
};

// Explicitly type INITIAL_EXERCISES to ensure consistency with types.ts
export const INITIAL_EXERCISES: Exercise[] = [
  { id: 'bench', name: 'Développé Couché', oneRM: 100 },
  { id: 'squat', name: 'Squat', oneRM: 140 },
  { id: 'deadlift', name: 'Soulevé de Terre', oneRM: 180 },
  { id: 'pullups', name: 'Tractions Lestées', oneRM: 40 },
  { id: 'dips', name: 'Dips Lestés', oneRM: 50 },
];

// Explicitly type INITIAL_SESSIONS to fix the "string is not assignable to WorkoutFormat" error in App.tsx
export const INITIAL_SESSIONS: WorkoutSession[] = [
  {
    id: 's1',
    name: 'Séance 1 : Force Poussée',
    exercises: [
      { exerciseId: 'bench', format: '3x3' },
      { exerciseId: 'dips', format: '4x5' },
    ],
  },
  {
    id: 's2',
    name: 'Séance 2 : Jambes / Pull',
    exercises: [
      { exerciseId: 'squat', format: '3x5' },
      { exerciseId: 'pullups', format: '1rep' },
    ],
  },
  {
    id: 's3',
    name: 'Séance 3 : Explosivité',
    exercises: [
      { exerciseId: 'bench', format: 'SPEED' },
      { exerciseId: 'deadlift', format: '3x3' },
    ],
  },
];
