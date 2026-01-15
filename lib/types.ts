/**
 * Core data types for the Fitness Tracker app
 */

export type WorkoutCategory = 'strength' | 'cardio' | 'flexibility' | 'hiit';
export type WorkoutDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ThemeMode = 'light' | 'dark' | 'system';
export type UnitSystem = 'metric' | 'imperial';

export interface Exercise {
  name: string;
  duration?: number; // seconds (optional if reps is used)
  reps?: number; // repetitions (optional if duration is used)
  rest: number; // seconds pause after exercise
}

export interface Workout {
  id: string;
  name: string;
  category: WorkoutCategory;
  difficulty: WorkoutDifficulty;
  duration: number; // total minutes
  exercises: Exercise[];
  description?: string;
  isCustom?: boolean; // true for user-created workouts
  createdAt?: string; // ISO date string
}

export interface CompletedWorkout {
  id: string;
  workoutId: string;
  workoutName: string;
  date: string; // ISO date string
  duration: number; // actual minutes completed
  caloriesBurned: number; // estimated
  exercises: number; // number of exercises completed
}

export interface CheckInData {
  checkIns: string[]; // array of ISO date strings
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string | null; // ISO date string
}

export interface UserProfile {
  name: string;
  weeklyGoal: number; // workouts per week
  theme: ThemeMode;
  notifications: boolean;
  unitSystem: UnitSystem;
  remindersEnabled: boolean;
  reminderTime?: string; // HH:mm format
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalMinutes: number;
  totalCalories: number;
  currentStreak: number;
  longestStreak: number;
  averageWorkoutsPerWeek: number;
}

export interface DailyActivity {
  date: string; // ISO date string
  workouts: number;
  minutes: number;
  calories: number;
}

export interface WeeklyProgress {
  week: string; // ISO week string
  workouts: number;
  minutes: number;
  calories: number;
}
