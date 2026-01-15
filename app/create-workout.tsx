import { ScrollView, Text, View, TextInput, Pressable, Alert, Platform } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { addCustomWorkout } from '@/lib/storage';
import type { WorkoutCategory, WorkoutDifficulty, Exercise } from '@/lib/types';

export default function CreateWorkoutScreen() {
  const colors = useColors();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WorkoutCategory>('strength');
  const [difficulty, setDifficulty] = useState<WorkoutDifficulty>('beginner');
  const [exercises, setExercises] = useState<Exercise[]>([
    { name: '', duration: 30, rest: 10 },
  ]);

  const categories: { value: WorkoutCategory; label: string }[] = [
    { value: 'strength', label: 'Kraft' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'flexibility', label: 'Flexibilität' },
    { value: 'hiit', label: 'HIIT' },
  ];

  const difficulties: { value: WorkoutDifficulty; label: string }[] = [
    { value: 'beginner', label: 'Anfänger' },
    { value: 'intermediate', label: 'Fortgeschritten' },
    { value: 'advanced', label: 'Experte' },
  ];

  const addExercise = () => {
    setExercises([...exercises, { name: '', duration: 30, rest: 10 }]);
  };

  const removeExercise = (index: number) => {
    if (exercises.length === 1) {
      if (Platform.OS === 'web') {
        window.alert('Ein Workout muss mindestens eine Übung enthalten.');
      } else {
        Alert.alert('Fehler', 'Ein Workout muss mindestens eine Übung enthalten.');
      }
      return;
    }
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const calculateDuration = () => {
    const totalSeconds = exercises.reduce((sum, ex) => sum + ex.duration + ex.rest, 0);
    return Math.ceil(totalSeconds / 60);
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Bitte geben Sie einen Namen ein.');
      } else {
        Alert.alert('Fehler', 'Bitte geben Sie einen Namen ein.');
      }
      return;
    }

    const hasEmptyExercise = exercises.some(ex => !ex.name.trim());
    if (hasEmptyExercise) {
      if (Platform.OS === 'web') {
        window.alert('Bitte füllen Sie alle Übungsnamen aus.');
      } else {
        Alert.alert('Fehler', 'Bitte füllen Sie alle Übungsnamen aus.');
      }
      return;
    }

    try {
      await addCustomWorkout({
        name: name.trim(),
        description: description.trim(),
        category,
        difficulty,
        duration: calculateDuration(),
        exercises,
      });

      if (Platform.OS === 'web') {
        window.alert('Workout erfolgreich erstellt!');
      } else {
        Alert.alert('Erfolg', 'Workout erfolgreich erstellt!');
      }
      router.back();
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Fehler beim Erstellen des Workouts.');
      } else {
        Alert.alert('Fehler', 'Fehler beim Erstellen des Workouts.');
      }
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, gap: 16 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-2xl font-bold text-foreground">Neues Workout</Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-base text-primary">Abbrechen</Text>
          </Pressable>
        </View>

        {/* Basic Info */}
        <Card>
          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Name *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="z.B. Mein Morgen-Workout"
                className="text-base text-foreground bg-surface rounded-lg px-3 py-2 border border-border"
                style={{ outlineStyle: 'none' } as any}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Beschreibung</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Optional: Beschreibe dein Workout"
                multiline
                numberOfLines={3}
                className="text-base text-foreground bg-surface rounded-lg px-3 py-2 border border-border"
                style={{ outlineStyle: 'none' } as any}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Kategorie</Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((cat) => (
                  <Pressable
                    key={cat.value}
                    onPress={() => setCategory(cat.value)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View
                      className={`px-4 py-2 rounded-full border ${
                        category === cat.value
                          ? 'bg-primary border-primary'
                          : 'bg-surface border-border'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          category === cat.value ? 'text-white' : 'text-foreground'
                        }`}
                      >
                        {cat.label}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-muted">Schwierigkeit</Text>
              <View className="flex-row flex-wrap gap-2">
                {difficulties.map((diff) => (
                  <Pressable
                    key={diff.value}
                    onPress={() => setDifficulty(diff.value)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <View
                      className={`px-4 py-2 rounded-full border ${
                        difficulty === diff.value
                          ? 'bg-primary border-primary'
                          : 'bg-surface border-border'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          difficulty === diff.value ? 'text-white' : 'text-foreground'
                        }`}
                      >
                        {diff.label}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="gap-1">
              <Text className="text-sm text-muted">Geschätzte Dauer</Text>
              <Text className="text-xl font-bold text-primary">{calculateDuration()} Min</Text>
            </View>
          </View>
        </Card>

        {/* Exercises */}
        <Card>
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">Übungen</Text>
              <Pressable onPress={addExercise}>
                <View className="flex-row items-center gap-1">
                  <Text className="text-sm font-medium text-primary">Hinzufügen</Text>
                  <Text className="text-lg text-primary">+</Text>
                </View>
              </Pressable>
            </View>

            {exercises.map((exercise, index) => (
              <View key={index} className="gap-3 p-3 bg-surface rounded-lg">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-medium text-muted">Übung {index + 1}</Text>
                  {exercises.length > 1 && (
                    <Pressable onPress={() => removeExercise(index)}>
                      <Text className="text-sm text-error">Entfernen</Text>
                    </Pressable>
                  )}
                </View>

                <TextInput
                  value={exercise.name}
                  onChangeText={(text) => updateExercise(index, 'name', text)}
                  placeholder="Übungsname"
                  className="text-base text-foreground bg-background rounded-lg px-3 py-2 border border-border"
                  style={{ outlineStyle: 'none' } as any}
                />

                <View className="flex-row gap-3">
                  <View className="flex-1 gap-1">
                    <Text className="text-xs text-muted">Dauer (Sek.)</Text>
                    <TextInput
                      value={exercise.duration.toString()}
                      onChangeText={(text) => updateExercise(index, 'duration', parseInt(text) || 0)}
                      keyboardType="numeric"
                      className="text-base text-foreground bg-background rounded-lg px-3 py-2 border border-border"
                      style={{ outlineStyle: 'none' } as any}
                    />
                  </View>

                  <View className="flex-1 gap-1">
                    <Text className="text-xs text-muted">Pause (Sek.)</Text>
                    <TextInput
                      value={exercise.rest.toString()}
                      onChangeText={(text) => updateExercise(index, 'rest', parseInt(text) || 0)}
                      keyboardType="numeric"
                      className="text-base text-foreground bg-background rounded-lg px-3 py-2 border border-border"
                      style={{ outlineStyle: 'none' } as any}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Save Button */}
        <Button variant="primary" onPress={handleSave}>
          Workout speichern
        </Button>

        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
