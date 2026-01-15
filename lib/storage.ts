/**
 * AsyncStorage helper functions for data persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, CheckInData, CompletedWorkout, Workout, WeightEntry } from './types';

// Storage keys
const KEYS = {
  USER_PROFILE: '@fittrack:user_profile',
  CHECK_INS: '@fittrack:check_ins',
  COMPLETED_WORKOUTS: '@fittrack:completed_workouts',
  WORKOUTS: '@fittrack:workouts',
  WORKOUTS_VERSION: '@fittrack:workouts_version',
  WEIGHT_ENTRIES: '@fittrack:weight_entries',
} as const;

// Current workout library version
const CURRENT_WORKOUTS_VERSION = 3; // Increased to 3 to remove default workouts

// Default values
export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Fitness-Enthusiast',
  weeklyGoal: 3,
  theme: 'system',
  notifications: true,
  unitSystem: 'metric',
  remindersEnabled: false,
};

export const DEFAULT_CHECK_IN_DATA: CheckInData = {
  checkIns: [],
  currentStreak: 0,
  longestStreak: 0,
  lastCheckIn: null,
};

// User Profile
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : DEFAULT_USER_PROFILE;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return DEFAULT_USER_PROFILE;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

// Check-ins
export async function getCheckInData(): Promise<CheckInData> {
  try {
    const data = await AsyncStorage.getItem(KEYS.CHECK_INS);
    return data ? JSON.parse(data) : DEFAULT_CHECK_IN_DATA;
  } catch (error) {
    console.error('Error loading check-in data:', error);
    return DEFAULT_CHECK_IN_DATA;
  }
}

export async function saveCheckInData(data: CheckInData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.CHECK_INS, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving check-in data:', error);
  }
}

export async function performCheckIn(): Promise<CheckInData> {
  const today = new Date().toISOString().split('T')[0];
  const data = await getCheckInData();

  // Check if already checked in today
  if (data.checkIns.includes(today)) {
    return data;
  }

  // Add today's check-in
  const updatedCheckIns = [...data.checkIns, today].sort();

  // Calculate streak
  let currentStreak = 1;
  const sortedDates = updatedCheckIns.sort().reverse();
  
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const current = new Date(sortedDates[i]);
    const next = new Date(sortedDates[i + 1]);
    const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  const updatedData: CheckInData = {
    checkIns: updatedCheckIns,
    currentStreak,
    longestStreak: Math.max(currentStreak, data.longestStreak),
    lastCheckIn: today,
  };

  await saveCheckInData(updatedData);
  return updatedData;
}

// Completed Workouts
export async function getCompletedWorkouts(): Promise<CompletedWorkout[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.COMPLETED_WORKOUTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading completed workouts:', error);
    return [];
  }
}

export async function saveCompletedWorkout(workout: CompletedWorkout): Promise<void> {
  try {
    const workouts = await getCompletedWorkouts();
    const updated = [...workouts, workout].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    await AsyncStorage.setItem(KEYS.COMPLETED_WORKOUTS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving completed workout:', error);
  }
}

// Workouts Library
export async function getWorkouts(): Promise<Workout[]> {
  try {
    const versionStr = await AsyncStorage.getItem(KEYS.WORKOUTS_VERSION);
    const storedVersion = versionStr ? parseInt(versionStr, 10) : 0;
    
    // Check if we need to update the workout library
    if (storedVersion < CURRENT_WORKOUTS_VERSION) {
      const defaultWorkouts = getDefaultWorkouts();
      await saveWorkouts(defaultWorkouts);
      await AsyncStorage.setItem(KEYS.WORKOUTS_VERSION, CURRENT_WORKOUTS_VERSION.toString());
      return defaultWorkouts;
    }
    
    const data = await AsyncStorage.getItem(KEYS.WORKOUTS);
    if (data) {
      return JSON.parse(data);
    }
    
    // If no workouts stored, initialize with default workouts
    const defaultWorkouts = getDefaultWorkouts();
    await saveWorkouts(defaultWorkouts);
    await AsyncStorage.setItem(KEYS.WORKOUTS_VERSION, CURRENT_WORKOUTS_VERSION.toString());
    return defaultWorkouts;
  } catch (error) {
    console.error('Error loading workouts:', error);
    return getDefaultWorkouts();
  }
}

export async function saveWorkouts(workouts: Workout[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));
    await AsyncStorage.setItem(KEYS.WORKOUTS_VERSION, CURRENT_WORKOUTS_VERSION.toString());
  } catch (error) {
    console.error('Error saving workouts:', error);
  }
}

// Force update workouts to latest version
export async function updateWorkoutsToLatest(): Promise<void> {
  try {
    const existingWorkouts = await getWorkouts();
    // Keep only custom workouts
    const customWorkouts = existingWorkouts.filter(w => w.isCustom);
    // Add new default workouts
    const defaultWorkouts = getDefaultWorkouts();
    const updatedWorkouts = [...defaultWorkouts, ...customWorkouts];
    await saveWorkouts(updatedWorkouts);
    await AsyncStorage.setItem(KEYS.WORKOUTS_VERSION, CURRENT_WORKOUTS_VERSION.toString());
  } catch (error) {
    console.error('Error updating workouts:', error);
  }
}

// Add a custom workout
export async function addCustomWorkout(workout: Omit<Workout, 'id' | 'isCustom' | 'createdAt'>): Promise<Workout> {
  try {
    const workouts = await getWorkouts();
    const newWorkout: Workout = {
      ...workout,
      id: `custom-${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    workouts.push(newWorkout);
    await saveWorkouts(workouts);
    return newWorkout;
  } catch (error) {
    console.error('Error adding custom workout:', error);
    throw error;
  }
}

// Update an existing workout
export async function updateWorkout(workoutId: string, updates: Partial<Workout>): Promise<void> {
  try {
    const workouts = await getWorkouts();
    const index = workouts.findIndex(w => w.id === workoutId);
    if (index === -1) {
      throw new Error('Workout not found');
    }
    // Only allow editing custom workouts
    if (!workouts[index].isCustom) {
      throw new Error('Cannot edit default workouts');
    }
    workouts[index] = { ...workouts[index], ...updates };
    await saveWorkouts(workouts);
  } catch (error) {
    console.error('Error updating workout:', error);
    throw error;
  }
}

// Delete a custom workout
export async function deleteWorkout(workoutId: string): Promise<void> {
  try {
    const workouts = await getWorkouts();
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) {
      throw new Error('Workout not found');
    }
    // Only allow deleting custom workouts
    if (!workout.isCustom) {
      throw new Error('Cannot delete default workouts');
    }
    const filtered = workouts.filter(w => w.id !== workoutId);
    await saveWorkouts(filtered);
  } catch (error) {
    console.error('Error deleting workout:', error);
    throw error;
  }
}

// Default workout library
function getDefaultWorkouts(): Workout[] {
  // No default workouts - users create their own
  return [
    /*{
      id: 'workout-1',
      name: 'Schnelles Morgen-Workout',
      category: 'hiit',
      difficulty: 'beginner',
      duration: 10,
      description: 'Ein energiegeladenes 10-Minuten-Workout für den perfekten Start in den Tag',
      exercises: [
        { name: 'Jumping Jacks', duration: 30, rest: 10 },
        { name: 'Kniebeugen', duration: 30, rest: 10 },
        { name: 'Liegestütze', duration: 30, rest: 10 },
        { name: 'Mountain Climbers', duration: 30, rest: 10 },
        { name: 'Plank', duration: 30, rest: 10 },
        { name: 'Burpees', duration: 30, rest: 10 },
        { name: 'High Knees', duration: 30, rest: 10 },
        { name: 'Lunges', duration: 30, rest: 10 },
        { name: 'Russian Twists', duration: 30, rest: 10 },
        { name: 'Cool Down Stretch', duration: 60, rest: 0 },
      ],
    },
    {
      id: 'workout-2',
      name: 'Kraft & Ausdauer',
      category: 'strength',
      difficulty: 'intermediate',
      duration: 20,
      description: 'Kombiniertes Kraft- und Ausdauertraining für den ganzen Körper',
      exercises: [
        { name: 'Warm-up Jog', duration: 60, rest: 10 },
        { name: 'Push-ups', duration: 45, rest: 15 },
        { name: 'Squats', duration: 45, rest: 15 },
        { name: 'Dips', duration: 45, rest: 15 },
        { name: 'Lunges', duration: 45, rest: 15 },
        { name: 'Plank Hold', duration: 60, rest: 15 },
        { name: 'Bicycle Crunches', duration: 45, rest: 15 },
        { name: 'Jump Squats', duration: 30, rest: 15 },
        { name: 'Mountain Climbers', duration: 45, rest: 15 },
        { name: 'Cool Down', duration: 90, rest: 0 },
      ],
    },
    {
      id: 'workout-3',
      name: 'Cardio Boost',
      category: 'cardio',
      difficulty: 'intermediate',
      duration: 15,
      description: 'Intensives Cardio-Training zur Fettverbrennung',
      exercises: [
        { name: 'Warm-up', duration: 60, rest: 10 },
        { name: 'High Knees', duration: 45, rest: 15 },
        { name: 'Burpees', duration: 30, rest: 15 },
        { name: 'Jump Rope (simuliert)', duration: 60, rest: 15 },
        { name: 'Mountain Climbers', duration: 45, rest: 15 },
        { name: 'Jumping Jacks', duration: 45, rest: 15 },
        { name: 'Sprint in Place', duration: 30, rest: 15 },
        { name: 'Box Jumps (simuliert)', duration: 30, rest: 15 },
        { name: 'Cool Down Jog', duration: 90, rest: 0 },
      ],
    },
    {
      id: 'workout-4',
      name: 'Yoga Flow',
      category: 'flexibility',
      difficulty: 'beginner',
      duration: 15,
      description: 'Entspannende Yoga-Sequenz für Flexibilität und Balance',
      exercises: [
        { name: 'Child\'s Pose', duration: 60, rest: 5 },
        { name: 'Cat-Cow Stretch', duration: 45, rest: 5 },
        { name: 'Downward Dog', duration: 60, rest: 5 },
        { name: 'Warrior I', duration: 45, rest: 5 },
        { name: 'Warrior II', duration: 45, rest: 5 },
        { name: 'Triangle Pose', duration: 45, rest: 5 },
        { name: 'Tree Pose', duration: 45, rest: 5 },
        { name: 'Pigeon Pose', duration: 60, rest: 5 },
        { name: 'Seated Forward Bend', duration: 60, rest: 5 },
        { name: 'Savasana', duration: 120, rest: 0 },
      ],
    },
    {
      id: 'workout-5',
      name: 'Core Crusher',
      category: 'strength',
      difficulty: 'advanced',
      duration: 12,
      description: 'Intensives Core-Training für eine starke Körpermitte',
      exercises: [
        { name: 'Plank', duration: 60, rest: 10 },
        { name: 'Side Plank (links)', duration: 45, rest: 10 },
        { name: 'Side Plank (rechts)', duration: 45, rest: 10 },
        { name: 'Russian Twists', duration: 45, rest: 10 },
        { name: 'Bicycle Crunches', duration: 45, rest: 10 },
        { name: 'Leg Raises', duration: 45, rest: 10 },
        { name: 'Mountain Climbers', duration: 45, rest: 10 },
        { name: 'V-Ups', duration: 30, rest: 10 },
        { name: 'Hollow Hold', duration: 30, rest: 10 },
        { name: 'Cool Down Stretch', duration: 60, rest: 0 },
      ],
    },
    {
      id: 'workout-6',
      name: 'Liegestütze-Challenge',
      category: 'strength',
      difficulty: 'intermediate',
      duration: 15,
      description: 'Fokussiertes Liegestütze-Training mit verschiedenen Variationen',
      exercises: [
        { name: 'Aufwärmen - Armkreisen', duration: 30, rest: 10 },
        { name: 'Standard Liegestütze', duration: 40, rest: 20 },
        { name: 'Breite Liegestütze', duration: 40, rest: 20 },
        { name: 'Enge Liegestütze (Trizeps)', duration: 40, rest: 20 },
        { name: 'Erhöhte Liegestütze (Füße hoch)', duration: 40, rest: 20 },
        { name: 'Diamant-Liegestütze', duration: 30, rest: 20 },
        { name: 'Explosive Liegestütze', duration: 30, rest: 20 },
        { name: 'Langsame Liegestütze (3 Sek. runter)', duration: 45, rest: 20 },
        { name: 'Plank Hold', duration: 45, rest: 15 },
        { name: 'Abschluss-Set Standard Liegestütze', duration: 40, rest: 10 },
        { name: 'Dehnung Brust & Schultern', duration: 60, rest: 0 },
      ],
    },
    {
      id: 'workout-7',
      name: 'Kniebeugen-Power',
      category: 'strength',
      difficulty: 'beginner',
      duration: 12,
      description: 'Effektives Beintraining mit Kniebeugen-Variationen',
      exercises: [
        { name: 'Beinmuskel aufwärmen', duration: 30, rest: 10 },
        { name: 'Bodyweight Kniebeugen', duration: 45, rest: 15 },
        { name: 'Breite Kniebeugen (Sumo)', duration: 45, rest: 15 },
        { name: 'Kniebeugen mit Pause unten', duration: 45, rest: 15 },
        { name: 'Einbeinige Kniebeugen (links)', duration: 30, rest: 10 },
        { name: 'Einbeinige Kniebeugen (rechts)', duration: 30, rest: 10 },
        { name: 'Jump Squats', duration: 30, rest: 20 },
        { name: 'Puls Squats (kleine Bewegungen)', duration: 40, rest: 15 },
        { name: 'Tiefe Kniebeugen', duration: 45, rest: 15 },
        { name: 'Abschluss-Set Kniebeugen', duration: 45, rest: 10 },
        { name: 'Beine dehnen', duration: 60, rest: 0 },
      ],
    },
    {
      id: 'workout-8',
      name: 'Ab Wheel Core-Training',
      category: 'strength',
      difficulty: 'advanced',
      duration: 10,
      description: 'Hochintensives Bauchmuskeltraining mit Ab Wheel und Core-Übungen',
      exercises: [
        { name: 'Core aktivieren - Plank', duration: 30, rest: 10 },
        { name: 'Ab Wheel Rollouts (kniend)', duration: 40, rest: 20 },
        { name: 'Plank mit Shoulder Taps', duration: 40, rest: 15 },
        { name: 'Ab Wheel seitlich (links)', duration: 30, rest: 15 },
        { name: 'Ab Wheel seitlich (rechts)', duration: 30, rest: 15 },
        { name: 'Dead Bug', duration: 45, rest: 15 },
        { name: 'Ab Wheel Rollouts (fortgeschritten)', duration: 40, rest: 20 },
        { name: 'Hollow Body Hold', duration: 30, rest: 15 },
        { name: 'Ab Wheel finale Runde', duration: 30, rest: 15 },
        { name: 'Core-Dehnung - Cobra Pose', duration: 45, rest: 0 },
      ],
    },*/
  ];
}

// Clear all data (for testing/reset)
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      KEYS.USER_PROFILE,
      KEYS.CHECK_INS,
      KEYS.COMPLETED_WORKOUTS,
      KEYS.WORKOUTS,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

// ========================================
// Weight Entries
// ========================================

export async function getWeightEntries(): Promise<WeightEntry[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.WEIGHT_ENTRIES);
    if (data) {
      const entries: WeightEntry[] = JSON.parse(data);
      // Sort by date descending (newest first)
      return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return [];
  } catch (error) {
    console.error('Error loading weight entries:', error);
    return [];
  }
}

export async function addWeightEntry(weight: number, note?: string): Promise<WeightEntry> {
  try {
    const entries = await getWeightEntries();
    const newEntry: WeightEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      weight,
      note,
    };
    entries.push(newEntry);
    await AsyncStorage.setItem(KEYS.WEIGHT_ENTRIES, JSON.stringify(entries));
    return newEntry;
  } catch (error) {
    console.error('Error adding weight entry:', error);
    throw error;
  }
}

export async function deleteWeightEntry(id: string): Promise<void> {
  try {
    const entries = await getWeightEntries();
    const filtered = entries.filter((entry) => entry.id !== id);
    await AsyncStorage.setItem(KEYS.WEIGHT_ENTRIES, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting weight entry:', error);
    throw error;
  }
}

export async function updateWeightEntry(id: string, weight: number, note?: string): Promise<void> {
  try {
    const entries = await getWeightEntries();
    const index = entries.findIndex((entry) => entry.id === id);
    if (index !== -1) {
      entries[index] = { ...entries[index], weight, note };
      await AsyncStorage.setItem(KEYS.WEIGHT_ENTRIES, JSON.stringify(entries));
    }
  } catch (error) {
    console.error('Error updating weight entry:', error);
    throw error;
  }
}
