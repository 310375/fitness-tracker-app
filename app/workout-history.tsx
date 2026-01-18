import { useState, useEffect } from 'react';
import { ScrollView, Text, View, FlatList, Platform, Alert, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getCompletedWorkouts, deleteCompletedWorkout } from '@/lib/storage';
import type { CompletedWorkout } from '@/lib/types';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function WorkoutHistoryScreen() {
  const colors = useColors();
  const [workouts, setWorkouts] = useState<CompletedWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWorkouts = async () => {
    try {
      const completed = await getCompletedWorkouts();
      // Sort by date descending (newest first)
      const sorted = completed.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setWorkouts(sorted);
    } catch (error) {
      console.error('Error loading workout history:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Heute';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Gestern';
    } else {
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'short',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async (workout: CompletedWorkout) => {
    const confirmDelete = () => {
      deleteCompletedWorkout(workout.id);
      loadWorkouts();
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Möchtest du das Workout "${workout.workoutName}" wirklich löschen?`
      );
      if (confirmed) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Workout löschen',
        `Möchtest du das Workout "${workout.workoutName}" wirklich löschen?`,
        [
          { text: 'Abbrechen', style: 'cancel' },
          { text: 'Löschen', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };

  const renderWorkoutItem = ({ item }: { item: CompletedWorkout }) => (
    <View className="bg-surface rounded-2xl p-4 mb-3">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-foreground mb-1">
            {item.workoutName}
          </Text>
          <Text className="text-sm text-muted">
            {formatDate(item.date)} • {formatTime(item.date)}
          </Text>
        </View>
        <Pressable
          onPress={() => handleDelete(item)}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <IconSymbol name="house.fill" size={20} color={colors.error} />
        </Pressable>
      </View>

      <View className="flex-row items-center gap-4 mt-3">
        <View className="flex-row items-center gap-1">
          <IconSymbol name="house.fill" size={16} color={colors.muted} />
          <Text className="text-sm text-muted">{item.duration} Min</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <IconSymbol name="house.fill" size={16} color={colors.muted} />
          <Text className="text-sm text-muted">{item.caloriesBurned} kcal</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <IconSymbol name="house.fill" size={16} color={colors.muted} />
          <Text className="text-sm text-muted">{item.exercises} Übungen</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-3">
          <View onTouchEnd={() => router.back()}>
            <IconSymbol 
              name="chevron.right" 
              size={28} 
              color={colors.foreground}
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </View>
          <Text className="text-2xl font-bold text-foreground">
            Workout-Historie
          </Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-muted">Lade...</Text>
        </View>
      ) : workouts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-4">💪</Text>
          <Text className="text-xl font-semibold text-foreground text-center mb-2">
            Noch keine Workouts
          </Text>
          <Text className="text-base text-muted text-center">
            Absolviere dein erstes Workout, um es hier zu sehen
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          {/* Stats Summary */}
          <View className="bg-surface rounded-2xl p-4 mb-4">
            <Text className="text-sm font-semibold text-muted mb-3">
              Gesamt
            </Text>
            <View className="flex-row items-center justify-around">
              <View className="items-center">
                <Text className="text-2xl font-bold text-primary">
                  {workouts.length}
                </Text>
                <Text className="text-sm text-muted mt-1">Workouts</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-primary">
                  {workouts.reduce((sum, w) => sum + w.duration, 0)}
                </Text>
                <Text className="text-sm text-muted mt-1">Minuten</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-primary">
                  {workouts.reduce((sum, w) => sum + w.caloriesBurned, 0)}
                </Text>
                <Text className="text-sm text-muted mt-1">Kalorien</Text>
              </View>
            </View>
          </View>

          {/* Workout List */}
          <FlatList
            data={workouts}
            renderItem={renderWorkoutItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      )}
    </ScreenContainer>
  );
}
