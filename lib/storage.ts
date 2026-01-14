/**
 * AsyncStorage helper functions for data persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, CheckInData, CompletedWorkout, Workout } from './types';

// Storage keys
const KEYS = {
  USER_PROFILE: '@fittrack:user_profile',
  CHECK_INS: '@fittrack:check_ins',
  COMPLETED_WORKOUTS: '@fittrack:completed_workouts',
  WORKOUTS: '@fittrack:workouts',
} as const;

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
    const data = await AsyncStorage.getItem(KEYS.WORKOUTS);
    if (data) {
      return JSON.parse(data);
    }
    // If no workouts stored, initialize with default workouts
    const defaultWorkouts = getDefaultWorkouts();
    await saveWorkouts(defaultWorkouts);
    return defaultWorkouts;
  } catch (error) {
    console.error('Error loading workouts:', error);
    return getDefaultWorkouts();
  }
}

export async function saveWorkouts(workouts: Workout[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));
  } catch (error) {
    console.error('Error saving workouts:', error);
  }
}

// Default workout library
function getDefaultWorkouts(): Workout[] {
  return [
    {
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
    },
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
