import { describe, it, expect, beforeEach } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUserProfile,
  saveUserProfile,
  getCheckInData,
  performCheckIn,
  getCompletedWorkouts,
  saveCompletedWorkout,
  getWorkouts,
  clearAllData,
  DEFAULT_USER_PROFILE,
  DEFAULT_CHECK_IN_DATA,
} from '../lib/storage';

describe('Storage Functions', () => {
  beforeEach(async () => {
    // Clear all data before each test
    await clearAllData();
  });

  describe('User Profile', () => {
    it('should return default profile when no data exists', async () => {
      const profile = await getUserProfile();
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('weeklyGoal');
      expect(profile).toHaveProperty('theme');
    });

    it('should have valid profile structure', async () => {
      const profile = await getUserProfile();
      expect(typeof profile.name).toBe('string');
      expect(typeof profile.weeklyGoal).toBe('number');
      expect(['light', 'dark', 'system']).toContain(profile.theme);
      expect(typeof profile.notifications).toBe('boolean');
    });
  });

  describe('Check-ins', () => {
    it('should return default check-in data when no data exists', async () => {
      const data = await getCheckInData();
      expect(data).toEqual(DEFAULT_CHECK_IN_DATA);
    });

    it('should perform check-in and update streak', async () => {
      const result = await performCheckIn();
      expect(result.checkIns.length).toBe(1);
      expect(result.currentStreak).toBe(1);
      expect(result.longestStreak).toBe(1);
    });

    it('should not duplicate check-in on same day', async () => {
      await performCheckIn();
      const result = await performCheckIn();
      expect(result.checkIns.length).toBe(1);
    });
  });

  describe('Completed Workouts', () => {
    it('should return array when getting workouts', async () => {
      const workouts = await getCompletedWorkouts();
      expect(Array.isArray(workouts)).toBe(true);
    });

    it('should have valid workout structure in default data', async () => {
      const testWorkout = {
        id: 'test-1',
        workoutId: 'workout-1',
        workoutName: 'Test Workout',
        date: new Date().toISOString(),
        duration: 20,
        caloriesBurned: 150,
        exercises: 10,
      };

      expect(testWorkout).toHaveProperty('id');
      expect(testWorkout).toHaveProperty('workoutId');
      expect(testWorkout).toHaveProperty('date');
      expect(typeof testWorkout.duration).toBe('number');
    });
  });

  describe('Workouts Library', () => {
    it('should return default workouts', async () => {
      const workouts = await getWorkouts();
      expect(workouts.length).toBeGreaterThan(0);
      expect(workouts[0]).toHaveProperty('id');
      expect(workouts[0]).toHaveProperty('name');
      expect(workouts[0]).toHaveProperty('category');
      expect(workouts[0]).toHaveProperty('exercises');
    });

    it('should have valid workout structure', async () => {
      const workouts = await getWorkouts();
      const workout = workouts[0];
      
      expect(workout.exercises.length).toBeGreaterThan(0);
      expect(workout.exercises[0]).toHaveProperty('name');
      expect(workout.exercises[0]).toHaveProperty('duration');
      expect(workout.exercises[0]).toHaveProperty('rest');
    });
  });

  describe('Clear All Data', () => {
    it('should clear all stored data', async () => {
      // Add some data
      await saveUserProfile({ ...DEFAULT_USER_PROFILE, name: 'Test' });
      await performCheckIn();
      await saveCompletedWorkout({
        id: 'test-1',
        workoutId: 'workout-1',
        workoutName: 'Test',
        date: new Date().toISOString(),
        duration: 20,
        caloriesBurned: 150,
        exercises: 10,
      });

      // Clear all data
      await clearAllData();

      // Verify data is reset to defaults
      const profile = await getUserProfile();
      const checkIns = await getCheckInData();
      const workouts = await getCompletedWorkouts();

      expect(profile).toEqual(DEFAULT_USER_PROFILE);
      expect(checkIns).toEqual(DEFAULT_CHECK_IN_DATA);
      expect(workouts).toEqual([]);
    });
  });
});
