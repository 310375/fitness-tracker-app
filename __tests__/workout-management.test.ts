import { describe, it, expect } from 'vitest';
import {
  getWorkouts,
  addCustomWorkout,
  updateWorkout,
  deleteWorkout,
} from '../lib/storage';

describe('Workout Management', () => {

  describe('Add Custom Workout', () => {
    it('should add a custom workout with correct properties', async () => {
      const newWorkout = await addCustomWorkout({
        name: 'Test Workout',
        description: 'Test Description',
        category: 'strength',
        difficulty: 'beginner',
        duration: 15,
        exercises: [
          { name: 'Exercise 1', duration: 30, rest: 10 },
          { name: 'Exercise 2', duration: 45, rest: 15 },
        ],
      });

      expect(newWorkout.name).toBe('Test Workout');
      expect(newWorkout.isCustom).toBe(true);
      expect(newWorkout.createdAt).toBeDefined();
      expect(newWorkout.id).toContain('custom-');
      expect(newWorkout.exercises.length).toBe(2);
    });

    it('should persist custom workout to storage', async () => {
      await addCustomWorkout({
        name: 'Persisted Workout',
        description: 'Test',
        category: 'cardio',
        difficulty: 'intermediate',
        duration: 20,
        exercises: [{ name: 'Running', duration: 60, rest: 0 }],
      });

      const workouts = await getWorkouts();
      const custom = workouts.find(w => w.name === 'Persisted Workout');
      
      expect(custom).toBeDefined();
      expect(custom?.isCustom).toBe(true);
    });
  });

  describe('Update Workout', () => {
    it('should update custom workout properties', async () => {
      const created = await addCustomWorkout({
        name: 'Original Name',
        description: 'Original Description',
        category: 'strength',
        difficulty: 'beginner',
        duration: 10,
        exercises: [{ name: 'Test', duration: 30, rest: 10 }],
      });

      await updateWorkout(created.id, {
        name: 'Updated Name',
        description: 'Updated Description',
      });

      const workouts = await getWorkouts();
      const updated = workouts.find(w => w.id === created.id);

      expect(updated?.name).toBe('Updated Name');
      expect(updated?.description).toBe('Updated Description');
    });

    it('should throw error when updating non-custom workout', async () => {
      const workouts = await getWorkouts();
      const defaultWorkout = workouts.find(w => !w.isCustom);

      if (defaultWorkout) {
        await expect(
          updateWorkout(defaultWorkout.id, { name: 'New Name' })
        ).rejects.toThrow('Cannot edit default workouts');
      }
    });

    it('should throw error when updating non-existent workout', async () => {
      await expect(
        updateWorkout('non-existent-id', { name: 'Test' })
      ).rejects.toThrow('Workout not found');
    });
  });

  describe('Delete Workout', () => {
    it('should delete custom workout', async () => {
      const created = await addCustomWorkout({
        name: 'To Delete',
        description: 'Test',
        category: 'hiit',
        difficulty: 'advanced',
        duration: 25,
        exercises: [{ name: 'Test', duration: 30, rest: 10 }],
      });

      // Verify it was created
      let workouts = await getWorkouts();
      let found = workouts.find(w => w.id === created.id);
      expect(found).toBeDefined();

      // Delete it
      await deleteWorkout(created.id);

      // Verify it was deleted
      workouts = await getWorkouts();
      const deleted = workouts.find(w => w.id === created.id);
      expect(deleted).toBeUndefined();
    });

    it('should throw error when deleting non-custom workout', async () => {
      const workouts = await getWorkouts();
      const defaultWorkout = workouts.find(w => !w.isCustom);

      if (defaultWorkout) {
        await expect(
          deleteWorkout(defaultWorkout.id)
        ).rejects.toThrow('Cannot delete default workouts');
      }
    });

    it('should throw error when deleting non-existent workout', async () => {
      await expect(
        deleteWorkout('non-existent-id')
      ).rejects.toThrow('Workout not found');
    });
  });

  describe('Workout Library', () => {
    it('should include both default and custom workouts', async () => {
      const custom1 = await addCustomWorkout({
        name: 'Custom 1',
        description: 'Test',
        category: 'strength',
        difficulty: 'beginner',
        duration: 10,
        exercises: [{ name: 'Test', duration: 30, rest: 10 }],
      });

      const custom2 = await addCustomWorkout({
        name: 'Custom 2',
        description: 'Test',
        category: 'cardio',
        difficulty: 'intermediate',
        duration: 15,
        exercises: [{ name: 'Test', duration: 30, rest: 10 }],
      });

      const workouts = await getWorkouts();
      const customWorkouts = workouts.filter(w => w.isCustom);
      const defaultWorkouts = workouts.filter(w => !w.isCustom);

      // Check that our custom workouts exist
      expect(customWorkouts.some(w => w.id === custom1.id)).toBe(true);
      expect(customWorkouts.some(w => w.id === custom2.id)).toBe(true);
      expect(defaultWorkouts.length).toBeGreaterThan(0);
    });
  });
});
