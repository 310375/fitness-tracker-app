import { ScrollView, Text, View, Pressable, RefreshControl } from 'react-native';
import { useState, useMemo } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { useColors } from '@/hooks/use-colors';
import { useWorkout } from '@/lib/workout-context';
import {
  calculateWorkoutStats,
  getLastNDaysActivity,
  formatDuration,
  formatCalories,
} from '@/lib/stats';

type TimePeriod = 'week' | 'month' | 'year';

export default function ProgressScreen() {
  const colors = useColors();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('week');
  const {
    completedWorkouts,
    workoutStreak,
    isLoading,
    refreshData,
  } = useWorkout();

  const heatmapData = useMemo(() => {
    const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365;
    const activity = getLastNDaysActivity(completedWorkouts, days);
    return activity.map((day) => ({
      date: day.date,
      count: day.workouts,
    }));
  }, [completedWorkouts, selectedPeriod]);

  const stats = calculateWorkoutStats(
    completedWorkouts,
    workoutStreak.currentStreak,
    workoutStreak.longestStreak
  );

  const periods: { id: TimePeriod; label: string }[] = [
    { id: 'week', label: 'Woche' },
    { id: 'month', label: 'Monat' },
    { id: 'year', label: 'Jahr' },
  ];

  const getHeatmapColor = (count: number): string => {
    if (count === 0) return colors.surface;
    if (count === 1) return `${colors.primary}40`;
    if (count === 2) return `${colors.primary}80`;
    return colors.primary;
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, gap: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshData} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <Text className="text-3xl font-bold text-foreground mb-2">
          Fortschritt
        </Text>

        {/* Period Selector */}
        <View className="flex-row gap-2 mb-2">
          {periods.map((period) => {
            const isSelected = selectedPeriod === period.id;
            return (
              <Pressable
                key={period.id}
                onPress={() => setSelectedPeriod(period.id)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View
                  className={`px-4 py-2 rounded-full border ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'bg-surface border-border'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {period.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap gap-3">
          <StatCard
            icon="figure.run"
            label="Workouts"
            value={stats.totalWorkouts}
            color={colors.primary}
          />
          <StatCard
            icon="flame.fill"
            label="Streak"
            value={stats.currentStreak}
            unit="Tage"
            color="#F59E0B"
          />
        </View>

        <View className="flex-row flex-wrap gap-3">
          <StatCard
            icon="clock.fill"
            label="Trainingszeit"
            value={formatDuration(stats.totalMinutes)}
            color="#10B981"
          />
          <StatCard
            icon="whatshot"
            label="Kalorien"
            value={formatCalories(stats.totalCalories)}
            unit="kcal"
            color="#EF4444"
          />
        </View>

        {/* Additional Stats */}
        <Card>
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted">Längste Streak</Text>
              <Text className="text-base font-semibold text-foreground">
                {stats.longestStreak} Tage
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted">Ø Workouts/Woche</Text>
              <Text className="text-base font-semibold text-foreground">
                {stats.averageWorkoutsPerWeek}
              </Text>
            </View>
          </View>
        </Card>

        {/* Activity Heatmap */}
        <Card>
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Aktivitäts-Kalender
            </Text>
            
            {selectedPeriod === 'week' && (
              <View className="gap-2">
                <View className="flex-row justify-between">
                  {(() => {
                    const today = new Date();
                    const dayLabels = [];
                    for (let i = 6; i >= 0; i--) {
                      const date = new Date(today);
                      date.setDate(today.getDate() - i);
                      const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
                      dayLabels.push(dayName.charAt(0).toUpperCase() + dayName.slice(1));
                    }
                    return dayLabels;
                  })().map((day, index) => (
                    <View key={day} className="items-center" style={{ width: 40 }}>
                      <View
                        className="w-8 h-8 rounded-lg mb-1"
                        style={{
                          backgroundColor: getHeatmapColor(heatmapData[index]?.count || 0),
                        }}
                      />
                      <Text className="text-xs text-muted">{day}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {selectedPeriod === 'month' && (
              <View className="gap-1">
                {Array.from({ length: 5 }).map((_, weekIndex) => (
                  <View key={weekIndex} className="flex-row gap-1">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const dataIndex = weekIndex * 7 + dayIndex;
                      const dayData = heatmapData[dataIndex];
                      if (!dayData) return <View key={dayIndex} style={{ width: 40, height: 40 }} />;
                      return (
                        <View
                          key={dayIndex}
                          className="rounded-lg"
                          style={{
                            width: 40,
                            height: 40,
                            backgroundColor: getHeatmapColor(dayData.count),
                          }}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            )}

            {selectedPeriod === 'year' && (
              <View className="gap-1">
                {Array.from({ length: 52 }).map((_, weekIndex) => (
                  <View key={weekIndex} className="flex-row gap-1">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const dataIndex = weekIndex * 7 + dayIndex;
                      const dayData = heatmapData[dataIndex];
                      if (!dayData) return null;
                      return (
                        <View
                          key={dayIndex}
                          className="rounded-sm"
                          style={{
                            width: 4,
                            height: 4,
                            backgroundColor: getHeatmapColor(dayData.count),
                          }}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
            )}

            {/* Legend */}
            <View className="flex-row items-center gap-2 mt-2">
              <Text className="text-xs text-muted">Weniger</Text>
              <View className="flex-row gap-1">
                {[0, 1, 2, 3].map((level) => (
                  <View
                    key={level}
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: getHeatmapColor(level),
                    }}
                  />
                ))}
              </View>
              <Text className="text-xs text-muted">Mehr</Text>
            </View>
          </View>
        </Card>

        {/* Recent Workouts */}
        {completedWorkouts.length > 0 && (
          <Card>
            <View className="gap-3">
              <Text className="text-lg font-semibold text-foreground">
                Letzte Workouts
              </Text>
              {completedWorkouts.slice(0, 5).map((workout) => {
                const date = new Date(workout.date);
                const dateStr = date.toLocaleDateString('de-DE', {
                  day: 'numeric',
                  month: 'short',
                });
                return (
                  <View
                    key={workout.id}
                    className="flex-row justify-between items-center py-2 border-b border-border last:border-b-0"
                  >
                    <View className="flex-1">
                      <Text className="text-base font-medium text-foreground">
                        {workout.workoutName}
                      </Text>
                      <Text className="text-sm text-muted">{dateStr}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-medium text-foreground">
                        {workout.duration} Min
                      </Text>
                      <Text className="text-sm text-muted">
                        {workout.caloriesBurned} kcal
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
