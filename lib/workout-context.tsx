import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getCheckInData,
  getCompletedWorkouts,
  getUserProfile,
  performCheckIn as performCheckInStorage,
} from './storage';
import { getLastNDaysActivity, calculateWorkoutStreak } from './stats';
import type { CheckInData, CompletedWorkout, UserProfile } from './types';

interface WorkoutContextValue {
  checkInData: CheckInData | null;
  userProfile: UserProfile | null;
  completedWorkouts: CompletedWorkout[];
  weeklyActivity: number[];
  todayWorkouts: number;
  workoutStreak: { currentStreak: number; longestStreak: number };
  isLoading: boolean;
  refreshData: () => Promise<void>;
  performCheckIn: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<number[]>([]);
  const [todayWorkouts, setTodayWorkouts] = useState(0);
  const [workoutStreak, setWorkoutStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [checkIns, profile, workouts] = await Promise.all([
        getCheckInData(),
        getUserProfile(),
        getCompletedWorkouts(),
      ]);

      setCheckInData(checkIns);
      setUserProfile(profile);
      setCompletedWorkouts(workouts);

      // Get last 7 days activity for weekly chart
      const lastWeek = getLastNDaysActivity(workouts, 7);
      setWeeklyActivity(lastWeek.map((day) => day.workouts));

      // Count today's workouts
      const today = new Date().toISOString().split('T')[0];
      const todayCount = workouts.filter(
        (w) => w.date.split('T')[0] === today
      ).length;
      setTodayWorkouts(todayCount);

      // Calculate workout streak
      const streak = calculateWorkoutStreak(workouts);
      setWorkoutStreak(streak);
    } catch (error) {
      console.error('Error loading workout data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const performCheckIn = useCallback(async () => {
    try {
      const updatedData = await performCheckInStorage();
      setCheckInData(updatedData);
      // Reload all data after check-in
      await refreshData();
    } catch (error) {
      console.error('Error performing check-in:', error);
    }
  }, [refreshData]);

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Reload data when page becomes visible (for web PWA)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshData]);

  // Also reload data every 10 seconds to ensure fresh data
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 10000);

    return () => clearInterval(interval);
  }, [refreshData]);

  const value: WorkoutContextValue = {
    checkInData,
    userProfile,
    completedWorkouts,
    weeklyActivity,
    todayWorkouts,
    workoutStreak,
    isLoading,
    refreshData,
    performCheckIn,
  };

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
