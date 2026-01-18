import { ScrollView, Text, View, RefreshControl } from 'react-native';
import { useMemo } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useRouter } from 'expo-router';
import { useWorkout } from '@/lib/workout-context';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const {
    checkInData,
    userProfile,
    weeklyActivity,
    todayWorkouts,
    workoutStreak,
    isLoading,
    refreshData,
    performCheckIn,
  } = useWorkout();

  const today = new Date().toISOString().split('T')[0];
  const hasCheckedInToday = checkInData?.checkIns.includes(today) || false;

  const currentDate = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const maxWorkouts = useMemo(() => Math.max(...weeklyActivity, 1), [weeklyActivity]);

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, gap: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} tintColor={colors.primary} />
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
                <IconSymbol name="house.fill" size={28} color={colors.primary} />
                <Text className="text-2xl font-bold text-foreground">
                  {workoutStreak.currentStreak}
                </Text>
                <Text className="text-base text-muted">Tage Streak</Text>
              </View>
              <Text className="text-sm text-muted">
                {workoutStreak.currentStreak > 0
                  ? 'Weiter so! 💪'
                  : 'Starte dein erstes Workout heute!'}
              </Text>
            </View>
            {!hasCheckedInToday && (
              <Button
                variant="primary"
                size="md"
                onPress={performCheckIn}
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
