import { describe, it, expect } from 'vitest';
import {
  calculateWorkoutStats,
  getDailyActivity,
  getLastNDaysActivity,
  estimateCalories,
  formatDuration,
  formatCalories,
  getWorkoutIntensity,
} from '../lib/stats';
import type { CompletedWorkout } from '../lib/types';

describe('Stats Functions', () => {
  const mockWorkouts: CompletedWorkout[] = [
    {
      id: '1',
      workoutId: 'w1',
      workoutName: 'Workout 1',
      date: '2026-01-10T10:00:00Z',
      duration: 20,
      caloriesBurned: 160,
      exercises: 10,
    },
    {
      id: '2',
      workoutId: 'w2',
      workoutName: 'Workout 2',
      date: '2026-01-12T10:00:00Z',
      duration: 30,
      caloriesBurned: 240,
      exercises: 12,
    },
    {
      id: '3',
      workoutId: 'w3',
      workoutName: 'Workout 3',
      date: '2026-01-14T10:00:00Z',
      duration: 25,
      caloriesBurned: 200,
      exercises: 11,
    },
  ];

  describe('calculateWorkoutStats', () => {
    it('should calculate correct statistics', () => {
      const stats = calculateWorkoutStats(mockWorkouts, 5, 10);
      
      expect(stats.totalWorkouts).toBe(3);
      expect(stats.totalMinutes).toBe(75);
      expect(stats.totalCalories).toBe(600);
      expect(stats.currentStreak).toBe(5);
      expect(stats.longestStreak).toBe(10);
      expect(stats.averageWorkoutsPerWeek).toBeGreaterThan(0);
    });

    it('should handle empty workout array', () => {
      const stats = calculateWorkoutStats([], 0, 0);
      
      expect(stats.totalWorkouts).toBe(0);
      expect(stats.totalMinutes).toBe(0);
      expect(stats.totalCalories).toBe(0);
      expect(stats.averageWorkoutsPerWeek).toBe(0);
    });
  });

  describe('getDailyActivity', () => {
    it('should aggregate workouts by day', () => {
      const startDate = new Date('2026-01-10');
      const endDate = new Date('2026-01-14');
      
      const activity = getDailyActivity(mockWorkouts, startDate, endDate);
      
      expect(activity.length).toBe(5);
      expect(activity[0].workouts).toBe(1);
      expect(activity[0].minutes).toBe(20);
      expect(activity[2].workouts).toBe(1);
      expect(activity[2].minutes).toBe(30);
    });

    it('should include days with no workouts', () => {
      const startDate = new Date('2026-01-10');
      const endDate = new Date('2026-01-14');
      
      const activity = getDailyActivity(mockWorkouts, startDate, endDate);
      
      const dayWithNoWorkout = activity[1];
      expect(dayWithNoWorkout.workouts).toBe(0);
      expect(dayWithNoWorkout.minutes).toBe(0);
      expect(dayWithNoWorkout.calories).toBe(0);
    });
  });

  describe('getLastNDaysActivity', () => {
    it('should return activity for last N days', () => {
      const activity = getLastNDaysActivity(mockWorkouts, 7);
      expect(activity.length).toBe(7);
    });
  });

  describe('estimateCalories', () => {
    it('should estimate calories for low intensity', () => {
      const calories = estimateCalories(20, 'low');
      expect(calories).toBe(100);
    });

    it('should estimate calories for moderate intensity', () => {
      const calories = estimateCalories(20, 'moderate');
      expect(calories).toBe(160);
    });

    it('should estimate calories for high intensity', () => {
      const calories = estimateCalories(20, 'high');
      expect(calories).toBe(240);
    });
  });

  describe('formatDuration', () => {
    it('should format minutes under 60', () => {
      expect(formatDuration(45)).toBe('45 Min');
    });

    it('should format hours without minutes', () => {
      expect(formatDuration(120)).toBe('2h');
    });

    it('should format hours with minutes', () => {
      expect(formatDuration(90)).toBe('1h 30min');
    });
  });

  describe('formatCalories', () => {
    it('should format calories under 1000', () => {
      expect(formatCalories(500)).toBe('500');
    });

    it('should format calories over 1000', () => {
      expect(formatCalories(1500)).toBe('1.5k');
    });
  });

  describe('getWorkoutIntensity', () => {
    it('should return low for flexibility', () => {
      expect(getWorkoutIntensity('flexibility')).toBe('low');
    });

    it('should return moderate for strength', () => {
      expect(getWorkoutIntensity('strength')).toBe('moderate');
    });

    it('should return high for cardio', () => {
      expect(getWorkoutIntensity('cardio')).toBe('high');
    });

    it('should return high for hiit', () => {
      expect(getWorkoutIntensity('hiit')).toBe('high');
    });

    it('should return moderate for unknown category', () => {
      expect(getWorkoutIntensity('unknown')).toBe('moderate');
    });
  });
});
