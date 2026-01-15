import { View, Text, ScrollView, TextInput, Pressable, Alert, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getWeightEntries, addWeightEntry, deleteWeightEntry, getUserProfile } from '@/lib/storage';
import type { WeightEntry, UserProfile } from '@/lib/types';

export default function WeightTrackingScreen() {
  const colors = useColors();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newWeight, setNewWeight] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const weightData = await getWeightEntries();
    const profileData = await getUserProfile();
    setEntries(weightData);
    setProfile(profileData);
  };

  const handleAddEntry = async () => {
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) {
      if (Platform.OS === 'web') {
        window.alert('Bitte gib ein gültiges Gewicht ein.');
      } else {
        Alert.alert('Fehler', 'Bitte gib ein gültiges Gewicht ein.');
      }
      return;
    }

    try {
      await addWeightEntry(weight, newNote || undefined);
      await loadData();
      setNewWeight('');
      setNewNote('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding weight entry:', error);
    }
  };

  const handleDeleteEntry = (id: string) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Möchtest du diesen Eintrag wirklich löschen?');
      if (confirmed) {
        deleteWeightEntry(id);
        loadData();
      }
    } else {
      Alert.alert('Eintrag löschen', 'Möchtest du diesen Eintrag wirklich löschen?', [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await deleteWeightEntry(id);
            await loadData();
          },
        },
      ]);
    }
  };

  const getWeightChange = () => {
    if (entries.length < 2) return null;
    const latest = entries[0].weight;
    const oldest = entries[entries.length - 1].weight;
    const change = latest - oldest;
    return {
      value: Math.abs(change),
      isIncrease: change > 0,
      percentage: ((change / oldest) * 100).toFixed(1),
    };
  };

  const getAverageWeight = () => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, entry) => acc + entry.weight, 0);
    return (sum / entries.length).toFixed(1);
  };

  const getWeeklyTrend = () => {
    if (entries.length < 2) return null;
    
    // Calculate average weight change per week
    const latest = entries[0];
    const oldest = entries[entries.length - 1];
    const weightDiff = latest.weight - oldest.weight;
    
    const daysDiff = (new Date(latest.date).getTime() - new Date(oldest.date).getTime()) / (1000 * 60 * 60 * 24);
    const weeksDiff = daysDiff / 7;
    
    if (weeksDiff < 0.5) return null; // Need at least 3-4 days of data
    
    return weightDiff / weeksDiff; // kg/lbs per week
  };

  const getTargetProgress = () => {
    if (!profile?.targetWeight || !profile?.weight || entries.length === 0) return null;
    
    const currentWeight = entries[0].weight;
    const startWeight = profile.weight;
    const targetWeight = profile.targetWeight;
    
    const totalChange = targetWeight - startWeight;
    const currentChange = currentWeight - startWeight;
    
    if (totalChange === 0) return null;
    
    const progress = (currentChange / totalChange) * 100;
    const remaining = Math.abs(targetWeight - currentWeight);
    
    // Estimate time to goal based on trend
    const weeklyTrend = getWeeklyTrend();
    let weeksToGoal = null;
    if (weeklyTrend && Math.abs(weeklyTrend) > 0.01) {
      const changeNeeded = targetWeight - currentWeight;
      weeksToGoal = Math.abs(changeNeeded / weeklyTrend);
    }
    
    return {
      progress: Math.min(Math.max(progress, 0), 100),
      remaining,
      weeksToGoal,
      isOnTrack: weeklyTrend ? (totalChange > 0 ? weeklyTrend > 0 : weeklyTrend < 0) : null,
    };
  };

  const unitLabel = profile?.unitSystem === 'imperial' ? 'lbs' : 'kg';
  const weightChange = getWeightChange();
  const targetProgress = getTargetProgress();
  const weeklyTrend = getWeeklyTrend();

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, gap: 16 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={28} color={colors.foreground} />
            </Pressable>
            <Text className="text-2xl font-bold text-foreground">Gewichtsverlauf</Text>
          </View>
        </View>

        {/* Stats */}
        {entries.length > 0 && (
          <View className="flex-row gap-3">
            <Card className="flex-1">
              <View className="items-center">
                <Text className="text-xs text-muted mb-1">Aktuell</Text>
                <Text className="text-2xl font-bold text-foreground">
                  {entries[0].weight} {unitLabel}
                </Text>
              </View>
            </Card>

            <Card className="flex-1">
              <View className="items-center">
                <Text className="text-xs text-muted mb-1">Durchschnitt</Text>
                <Text className="text-2xl font-bold text-foreground">
                  {getAverageWeight()} {unitLabel}
                </Text>
              </View>
            </Card>

            {weightChange && (
              <Card className="flex-1">
                <View className="items-center">
                  <Text className="text-xs text-muted mb-1">Änderung</Text>
                  <Text
                    className={`text-2xl font-bold ${
                      weightChange.isIncrease ? 'text-warning' : 'text-success'
                    }`}
                  >
                    {weightChange.isIncrease ? '+' : '-'}
                    {weightChange.value.toFixed(1)}
                  </Text>
                  <Text className="text-xs text-muted">{weightChange.percentage}%</Text>
                </View>
              </Card>
            )}
          </View>
        )}

        {/* Target Progress */}
        {targetProgress && profile?.targetWeight && (
          <Card>
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-foreground">Zielgewicht</Text>
                <Text className="text-base font-semibold text-primary">
                  {profile.targetWeight} {unitLabel}
                </Text>
              </View>

              {/* Progress Bar */}
              <View className="gap-2">
                <View className="h-3 bg-surface rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${targetProgress.progress}%` }}
                  />
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">
                    {targetProgress.progress.toFixed(0)}% erreicht
                  </Text>
                  <Text className="text-sm text-muted">
                    Noch {targetProgress.remaining.toFixed(1)} {unitLabel}
                  </Text>
                </View>
              </View>

              {/* Trend Info */}
              {weeklyTrend && (
                <View className="bg-surface rounded-lg p-3">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm text-muted">Wöchentlicher Trend</Text>
                    <Text
                      className={`text-sm font-semibold ${
                        targetProgress.isOnTrack ? 'text-success' : 'text-warning'
                      }`}
                    >
                      {weeklyTrend > 0 ? '+' : ''}{weeklyTrend.toFixed(2)} {unitLabel}/Woche
                    </Text>
                  </View>
                  {targetProgress.weeksToGoal && targetProgress.weeksToGoal < 100 && (
                    <Text className="text-sm text-muted">
                      Geschätzte Erreichung: {targetProgress.weeksToGoal < 4
                        ? `${Math.ceil(targetProgress.weeksToGoal)} Wochen`
                        : `${Math.ceil(targetProgress.weeksToGoal / 4)} Monate`}
                    </Text>
                  )}
                  {targetProgress.isOnTrack !== null && (
                    <Text className="text-xs text-muted mt-1">
                      {targetProgress.isOnTrack
                        ? '✅ Du bist auf dem richtigen Weg!'
                        : '⚠️ Dein Trend geht in die andere Richtung'}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Chart */}
        {entries.length > 1 && (
          <Card>
            <Text className="text-lg font-semibold text-foreground mb-4">Verlauf</Text>
            <View className="h-48 justify-end">
              {/* Simple line chart visualization */}
              <View className="flex-row items-end justify-between h-full">
                {entries
                  .slice(0, 10)
                  .reverse()
                  .map((entry, index) => {
                    const minWeight = Math.min(...entries.map((e) => e.weight));
                    const maxWeight = Math.max(...entries.map((e) => e.weight));
                    const range = maxWeight - minWeight || 1;
                    const height = ((entry.weight - minWeight) / range) * 100;

                    return (
                      <View key={entry.id} className="flex-1 items-center gap-2">
                        <View className="flex-1 justify-end items-center w-full px-1">
                          <View
                            className="w-full bg-primary rounded-t-lg"
                            style={{ height: `${Math.max(height, 10)}%` }}
                          />
                        </View>
                        <Text className="text-xs text-muted">
                          {new Date(entry.date).getDate()}/{new Date(entry.date).getMonth() + 1}
                        </Text>
                      </View>
                    );
                  })}
              </View>
            </View>
          </Card>
        )}

        {/* Add New Entry */}
        <Card>
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">Neuer Eintrag</Text>
              {!isAdding && (
                <Pressable onPress={() => setIsAdding(true)}>
                  <Text className="text-sm font-medium text-primary">Hinzufügen</Text>
                </Pressable>
              )}
            </View>

            {isAdding && (
              <View className="gap-3">
                <View className="gap-2">
                  <Text className="text-sm text-muted">Gewicht ({unitLabel})</Text>
                  <TextInput
                    value={newWeight}
                    onChangeText={setNewWeight}
                    keyboardType="decimal-pad"
                    placeholder={`z.B. 70`}
                    className="text-base text-foreground bg-surface rounded-lg px-3 py-2 border border-border"
                    style={{ outlineStyle: 'none' } as any}
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-sm text-muted">Notiz (optional)</Text>
                  <TextInput
                    value={newNote}
                    onChangeText={setNewNote}
                    placeholder="z.B. Nach dem Training"
                    className="text-base text-foreground bg-surface rounded-lg px-3 py-2 border border-border"
                    style={{ outlineStyle: 'none' } as any}
                  />
                </View>

                <View className="flex-row gap-2">
                  <Button variant="secondary" onPress={() => setIsAdding(false)} className="flex-1">
                    Abbrechen
                  </Button>
                  <Button variant="primary" onPress={handleAddEntry} className="flex-1">
                    Speichern
                  </Button>
                </View>
              </View>
            )}
          </View>
        </Card>

        {/* Entries List */}
        <Card>
          <Text className="text-lg font-semibold text-foreground mb-4">Einträge</Text>
          {entries.length === 0 ? (
            <Text className="text-base text-muted text-center py-8">
              Noch keine Einträge vorhanden.{'\n'}Füge deinen ersten Gewichtseintrag hinzu!
            </Text>
          ) : (
            <View className="gap-3">
              {entries.map((entry) => (
                <View
                  key={entry.id}
                  className="flex-row items-center justify-between py-3 border-b border-border"
                >
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">
                      {entry.weight} {unitLabel}
                    </Text>
                    <Text className="text-sm text-muted">
                      {new Date(entry.date).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                    {entry.note && (
                      <Text className="text-sm text-muted mt-1">{entry.note}</Text>
                    )}
                  </View>
                  <Pressable onPress={() => handleDeleteEntry(entry.id)}>
                    <Text className="text-sm text-error">Löschen</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}
