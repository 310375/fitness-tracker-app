import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useRouter } from 'expo-router';
import {
  getCheckInData,
  performCheckIn,
  getCompletedWorkouts,
  getUserProfile,
} from '@/lib/storage';
import { getLastNDaysActivity } from '@/lib/stats';
import type { CheckInData, CompletedWorkout, UserProfile } from '@/lib/types';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [todayWorkouts, setTodayWorkouts] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [checkIns, profile, completedWorkouts] = await Promise.all([
        getCheckInData(),
        getUserProfile(),
        getCompletedWorkouts(),
      ]);

      setCheckInData(checkIns);
      setUserProfile(profile);

      // Get last 7 days activity for weekly chart
      const lastWeek = getLastNDaysActivity(completedWorkouts, 7);
      setWeeklyActivity(lastWeek.map((day) => day.workouts));

      // Count today's workouts
      const today = new Date().toISOString().split('T')[0];
      const todayCount = completedWorkouts.filter(
        (w) => w.date.split('T')[0] === today
      ).length;
      setTodayWorkouts(todayCount);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleCheckIn = async () => {
    try {
      const updatedData = await performCheckIn();
      setCheckInData(updatedData);
    } catch (error) {
      console.error('Error performing check-in:', error);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = checkInData?.checkIns.includes(today) || false;

  const currentDate = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const maxWorkouts = Math.max(...weeklyActivity, 1);

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, gap: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Hero Section */}
        <View className="gap-1 mb-2">
          <Text className="text-3xl font-bold text-foreground">
            Hallo, {userProfile?.name || 'Fitness-Enthusiast'}! 👋
          </Text>
          <Text className="text-base text-muted">{currentDate}</Text>
        </View>

        {/* Check-in Card */}
        <Card className="bg-primary/10 border-primary/20">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 gap-2">
              <View className="flex-row items-center gap-2">
                <IconSymbol name="flame.fill" size={28} color={colors.primary} />
                <Text className="text-2xl font-bold text-foreground">
                  {checkInData?.currentStreak || 0}
                </Text>
                <Text className="text-base text-muted">Tage Streak</Text>
              </View>
              <Text className="text-sm text-muted">
                {hasCheckedInToday
                  ? '✓ Heute bereits eingecheckt'
                  : 'Checke heute ein, um deine Streak fortzusetzen!'}
              </Text>
            </View>
            {!hasCheckedInToday && (
              <Button
                variant="primary"
                size="md"
                onPress={handleCheckIn}
                className="ml-2"
              >
                Check-in
              </Button>
            )}
          </View>
        </Card>

        {/* Today's Progress */}
        <Card>
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">
                Heutiger Fortschritt
              </Text>
              <Text className="text-sm text-muted">
                {todayWorkouts} / {userProfile?.weeklyGoal || 3} Workouts
              </Text>
            </View>
            <View className="h-2 bg-surface rounded-full overflow-hidden">
              <View
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${Math.min((todayWorkouts / (userProfile?.weeklyGoal || 3)) * 100, 100)}%`,
                }}
              />
            </View>
          </View>
        </Card>

        {/* Weekly Activity Chart */}
        <Card>
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Wöchentliche Aktivität
            </Text>
            <View className="flex-row items-end justify-between gap-2 h-24">
              {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day, index) => {
                const workouts = weeklyActivity[index] || 0;
                const height = maxWorkouts > 0 ? (workouts / maxWorkouts) * 100 : 0;
                return (
                  <View key={day} className="flex-1 items-center gap-2">
                    <View className="flex-1 w-full justify-end">
                      <View
                        className="w-full bg-primary rounded-t-lg"
                        style={{
                          height: `${Math.max(height, workouts > 0 ? 10 : 0)}%`,
                        }}
                      />
                    </View>
                    <Text className="text-xs text-muted">{day}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <View className="gap-3">
          <Text className="text-lg font-semibold text-foreground">
            Schnellzugriff
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                variant="primary"
                size="lg"
                onPress={() => router.push('/(tabs)/workouts')}
              >
                Workout starten
              </Button>
            </View>
            <View className="flex-1">
              <Button
                variant="outline"
                size="lg"
                onPress={() => router.push('/(tabs)/progress')}
              >
                Fortschritt
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
