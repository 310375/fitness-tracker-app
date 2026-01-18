/**
 * Statistics calculation functions
 */

import type { CompletedWorkout, WorkoutStats, DailyActivity, WeeklyProgress } from './types';

/**
 * Calculate overall workout statistics
 */
export function calculateWorkoutStats(
  completedWorkouts: CompletedWorkout[],
  currentStreak: number,
  longestStreak: number
): WorkoutStats {
  const totalWorkouts = completedWorkouts.length;
  const totalMinutes = completedWorkouts.reduce((sum, w) => sum + w.duration, 0);
  const totalCalories = completedWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);

  // Calculate average workouts per week
  let averageWorkoutsPerWeek = 0;
  if (completedWorkouts.length > 0) {
    const sortedWorkouts = [...completedWorkouts].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const firstWorkoutDate = new Date(sortedWorkouts[0].date);
    const lastWorkoutDate = new Date(sortedWorkouts[sortedWorkouts.length - 1].date);
    const daysDiff = Math.max(
      1,
      Math.floor((lastWorkoutDate.getTime() - firstWorkoutDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const weeks = Math.max(1, daysDiff / 7);
    averageWorkoutsPerWeek = Math.round((totalWorkouts / weeks) * 10) / 10;
  }

  return {
    totalWorkouts,
    totalMinutes,
    totalCalories,
    currentStreak,
    longestStreak,
    averageWorkoutsPerWeek,
  };
}

/**
 * Get daily activity data for a date range
 */
export function getDailyActivity(
  completedWorkouts: CompletedWorkout[],
  startDate: Date,
  endDate: Date
): DailyActivity[] {
  const activities: Map<string, DailyActivity> = new Map();

  // Initialize all dates in range
  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    activities.set(dateStr, {
      date: dateStr,
      workouts: 0,
      minutes: 0,
      calories: 0,
    });
    current.setDate(current.getDate() + 1);
  }

  // Aggregate workout data
  completedWorkouts.forEach((workout) => {
    const dateStr = workout.date.split('T')[0];
    const activity = activities.get(dateStr);
    if (activity) {
      activity.workouts += 1;
      activity.minutes += workout.duration;
      activity.calories += workout.caloriesBurned;
    }
  });

  return Array.from(activities.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Get weekly progress data
 */
export function getWeeklyProgress(
  completedWorkouts: CompletedWorkout[],
  weeksCount: number = 12
): WeeklyProgress[] {
  const weeks: Map<string, WeeklyProgress> = new Map();

  // Calculate week start dates
  const today = new Date();
  for (let i = 0; i < weeksCount; i++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (i * 7) - today.getDay());
    const weekStr = weekStart.toISOString().split('T')[0];
    weeks.set(weekStr, {
      week: weekStr,
      workouts: 0,
      minutes: 0,
      calories: 0,
    });
  }

  // Aggregate workout data by week
  completedWorkouts.forEach((workout) => {
    const workoutDate = new Date(workout.date);
    const weekStart = new Date(workoutDate);
    weekStart.setDate(workoutDate.getDate() - workoutDate.getDay());
    const weekStr = weekStart.toISOString().split('T')[0];

    const weekData = weeks.get(weekStr);
    if (weekData) {
      weekData.workouts += 1;
      weekData.minutes += workout.duration;
      weekData.calories += workout.caloriesBurned;
    }
  });

  return Array.from(weeks.values()).sort(
    (a, b) => new Date(a.week).getTime() - new Date(b.week).getTime()
  );
}

/**
 * Get last N days of activity
 */
export function getLastNDaysActivity(
  completedWorkouts: CompletedWorkout[],
  days: number
): DailyActivity[] {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days + 1);

  return getDailyActivity(completedWorkouts, startDate, endDate);
}

/**
 * Estimate calories burned based on workout duration
 * Simple estimation: ~8 calories per minute for moderate intensity
 */
export function estimateCalories(durationMinutes: number, intensity: 'low' | 'moderate' | 'high' = 'moderate'): number {
  const caloriesPerMinute = {
    low: 5,
    moderate: 8,
    high: 12,
  };
  return Math.round(durationMinutes * caloriesPerMinute[intensity]);
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} Min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Format calories to human-readable string
 */
export function formatCalories(calories: number): string {
  if (calories >= 1000) {
    return `${(calories / 1000).toFixed(1)}k`;
  }
  return calories.toString();
}

/**
 * Calculate current and longest streak based on completed workouts
 */
export function calculateWorkoutStreak(completedWorkouts: CompletedWorkout[]): { currentStreak: number; longestStreak: number } {
  if (completedWorkouts.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Group workouts by date
  const workoutsByDate = new Map<string, number>();
  completedWorkouts.forEach((workout) => {
    const dateStr = workout.date.split('T')[0];
    workoutsByDate.set(dateStr, (workoutsByDate.get(dateStr) || 0) + 1);
  });

  // Get sorted unique dates
  const sortedDates = Array.from(workoutsByDate.keys()).sort();

  // Calculate streaks
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Check if today has a workout
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Start from the most recent date
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const currentDate = new Date(sortedDates[i]);
    const nextDate = i > 0 ? new Date(sortedDates[i - 1]) : null;

    if (i === sortedDates.length - 1) {
      // First iteration - check if it's today or yesterday
      if (sortedDates[i] === today || sortedDates[i] === yesterdayStr) {
        tempStreak = 1;
      } else {
        // Most recent workout is not today or yesterday, so current streak is 0
        tempStreak = 0;
        break;
      }
    } else if (nextDate) {
      const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        break;
      }
    }
  }

  currentStreak = tempStreak;

  // Calculate longest streak
  tempStreak = 1;
  for (let i = sortedDates.length - 1; i > 0; i--) {
    const currentDate = new Date(sortedDates[i]);
    const nextDate = new Date(sortedDates[i - 1]);
    const diffDays = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}

/**
 * Get workout intensity level based on category
 */
export function getWorkoutIntensity(category: string): 'low' | 'moderate' | 'high' {
  switch (category) {
    case 'flexibility':
      return 'low';
    case 'strength':
      return 'moderate';
    case 'cardio':
    case 'hiit':
      return 'high';
    default:
      return 'moderate';
  }
}
