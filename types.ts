
export type ReadinessLevel = 'GOOD' | 'MEDIUM' | 'POOR';

export interface Exercise {
  id: string;
  name: string;
  oneRM: number;
}

export type WorkoutFormat = '4x5' | '3x5' | '3x3' | '1rep' | 'SPEED';

export interface SessionExercise {
  exerciseId: string;
  format: WorkoutFormat;
}

export interface WorkoutSession {
  id: string;
  name: string;
  exercises: SessionExercise[];
}

export interface ReadinessState {
  sleep: ReadinessLevel;
  form: ReadinessLevel;
  motivation: ReadinessLevel;
}

export interface CalculatedSet {
  exerciseName: string;
  format: string;
  load: number;
}
