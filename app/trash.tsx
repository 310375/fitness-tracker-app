import { View, Text, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getDeletedWorkouts, restoreWorkoutFromTrash, permanentlyDeleteWorkout, emptyTrash } from '@/lib/storage';
import type { DeletedWorkout } from '@/lib/types';

export default function TrashScreen() {
  const colors = useColors();
  const [deletedWorkouts, setDeletedWorkouts] = useState<DeletedWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await getDeletedWorkouts();
    setDeletedWorkouts(data);
    setLoading(false);
  };

  const handleRestore = async (workoutId: string) => {
    try {
      await restoreWorkoutFromTrash(workoutId);
      await loadData();
      
      if (Platform.OS === 'web') {
        window.alert('Workout wurde wiederhergestellt');
      } else {
        Alert.alert('Erfolg', 'Workout wurde wiederhergestellt');
      }
    } catch (error) {
      console.error('Error restoring workout:', error);
      if (Platform.OS === 'web') {
        window.alert('Fehler beim Wiederherstellen');
      } else {
        Alert.alert('Fehler', 'Fehler beim Wiederherstellen');
      }
    }
  };

  const handlePermanentDelete = (workoutId: string, workoutName: string) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `"${workoutName}" endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
      );
      if (confirmed) {
        permanentlyDeleteWorkout(workoutId);
        loadData();
      }
    } else {
      Alert.alert(
        'Endgültig löschen',
        `"${workoutName}" endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
        [
          { text: 'Abbrechen', style: 'cancel' },
          {
            text: 'Löschen',
            style: 'destructive',
            onPress: async () => {
              await permanentlyDeleteWorkout(workoutId);
              await loadData();
            },
          },
        ]
      );
    }
  };

  const handleEmptyTrash = () => {
    if (deletedWorkouts.length === 0) return;

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Papierkorb leeren? Alle Workouts werden endgültig gelöscht.'
      );
      if (confirmed) {
        emptyTrash();
        loadData();
      }
    } else {
      Alert.alert(
        'Papierkorb leeren',
        'Alle Workouts werden endgültig gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.',
        [
          { text: 'Abbrechen', style: 'cancel' },
          {
            text: 'Leeren',
            style: 'destructive',
            onPress: async () => {
              await emptyTrash();
              await loadData();
            },
          },
        ]
      );
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, gap: 16 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={28} color={colors.foreground} />
            </Pressable>
            <Text className="text-2xl font-bold text-foreground">Papierkorb</Text>
          </View>
          {deletedWorkouts.length > 0 && (
            <Pressable onPress={handleEmptyTrash}>
              <Text className="text-sm text-error font-semibold">Leeren</Text>
            </Pressable>
          )}
        </View>

        {/* Info */}
        <Card className="bg-surface">
          <Text className="text-sm text-muted">
            Gelöschte Workouts werden 30 Tage lang aufbewahrt und können wiederhergestellt werden.
          </Text>
        </Card>

        {/* Deleted Workouts */}
        {loading ? (
          <Text className="text-center text-muted mt-8">Lade...</Text>
        ) : deletedWorkouts.length === 0 ? (
          <View className="items-center mt-12">
            <Text className="text-6xl mb-4">🗑️</Text>
            <Text className="text-lg font-semibold text-foreground mb-2">Papierkorb ist leer</Text>
            <Text className="text-sm text-muted text-center">
              Gelöschte Workouts erscheinen hier
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {deletedWorkouts.map((item) => {
              const daysRemaining = getDaysRemaining(item.expiresAt);
              return (
                <Card key={item.workout.id}>
                  <View className="gap-3">
                    <View>
                      <Text className="text-lg font-semibold text-foreground mb-1">
                        {item.workout.name}
                      </Text>
                      <Text className="text-sm text-muted">
                        {item.workout.category} • {item.workout.difficulty} • {item.workout.duration} Min
                      </Text>
                      <Text className="text-xs text-warning mt-2">
                        Wird in {daysRemaining} {daysRemaining === 1 ? 'Tag' : 'Tagen'} endgültig gelöscht
                      </Text>
                    </View>

                    <View className="flex-row gap-2">
                      <Button
                        variant="primary"
                        onPress={() => handleRestore(item.workout.id)}
                        className="flex-1"
                      >
                        Wiederherstellen
                      </Button>
                      <Button
                        variant="secondary"
                        onPress={() => handlePermanentDelete(item.workout.id, item.workout.name)}
                        className="flex-1"
                      >
                        Endgültig löschen
                      </Button>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
