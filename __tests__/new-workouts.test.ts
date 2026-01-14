import { describe, it, expect } from 'vitest';
import { getWorkouts } from '../lib/storage';

describe('New Workouts', () => {
  it('should include Liegestütze-Challenge workout', async () => {
    const workouts = await getWorkouts();
    const pushupWorkout = workouts.find(w => w.id === 'workout-6');
    
    expect(pushupWorkout).toBeDefined();
    expect(pushupWorkout?.name).toBe('Liegestütze-Challenge');
    expect(pushupWorkout?.category).toBe('strength');
    expect(pushupWorkout?.difficulty).toBe('intermediate');
    expect(pushupWorkout?.exercises.length).toBeGreaterThan(0);
  });

  it('should include Kniebeugen-Power workout', async () => {
    const workouts = await getWorkouts();
    const squatWorkout = workouts.find(w => w.id === 'workout-7');
    
    expect(squatWorkout).toBeDefined();
    expect(squatWorkout?.name).toBe('Kniebeugen-Power');
    expect(squatWorkout?.category).toBe('strength');
    expect(squatWorkout?.difficulty).toBe('beginner');
    expect(squatWorkout?.exercises.length).toBeGreaterThan(0);
  });

  it('should include Ab Wheel Core-Training workout', async () => {
    const workouts = await getWorkouts();
    const abWheelWorkout = workouts.find(w => w.id === 'workout-8');
    
    expect(abWheelWorkout).toBeDefined();
    expect(abWheelWorkout?.name).toBe('Ab Wheel Core-Training');
    expect(abWheelWorkout?.category).toBe('strength');
    expect(abWheelWorkout?.difficulty).toBe('advanced');
    expect(abWheelWorkout?.exercises.length).toBeGreaterThan(0);
  });

  it('should have 8 total workouts', async () => {
    const workouts = await getWorkouts();
    expect(workouts.length).toBe(8);
  });

  it('should have valid exercise structure in new workouts', async () => {
    const workouts = await getWorkouts();
    const newWorkouts = workouts.filter(w => 
      ['workout-6', 'workout-7', 'workout-8'].includes(w.id)
    );

    newWorkouts.forEach(workout => {
      expect(workout.exercises.length).toBeGreaterThan(0);
      workout.exercises.forEach(exercise => {
        expect(exercise).toHaveProperty('name');
        expect(exercise).toHaveProperty('duration');
        expect(exercise).toHaveProperty('rest');
        expect(typeof exercise.duration).toBe('number');
        expect(typeof exercise.rest).toBe('number');
      });
    });
  });
});
