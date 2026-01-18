import { View, Text, ScrollView, TextInput, Pressable, Alert, Switch, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getUserProfile, saveUserProfile, clearAllData, updateWorkoutsToLatest } from '@/lib/storage';
import { exportData, importData } from '@/lib/backup';
import type { UserProfile, ThemeMode } from '@/lib/types';
import { APP_VERSION, BUILD_DATE } from '@/lib/version';

export default function ProfileScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const data = await getUserProfile();
    setProfile(data);
  };

  const handleSave = async () => {
    if (profile) {
      await saveUserProfile(profile);
      setIsEditing(false);
    }
  };

  const handleResetData = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Möchtest du wirklich alle Daten zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.'
      );
      if (confirmed) {
        clearAllData();
        loadProfile();
      }
    } else {
      Alert.alert(
        'Daten zurücksetzen',
        'Möchtest du wirklich alle Daten zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.',
        [
          { text: 'Abbrechen', style: 'cancel' },
          {
            text: 'Zurücksetzen',
            style: 'destructive',
            onPress: async () => {
              await clearAllData();
              await loadProfile();
            },
          },
        ]
      );
    }
  };

  if (!profile) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-muted">Lädt...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20, gap: 16 }}>
        {/* Header */}
        <View className="items-center gap-2 mb-4">
          <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center">
            <Text className="text-4xl">💪</Text>
          </View>
          <Text className="text-2xl font-bold text-foreground">
            {profile.name}
          </Text>
        </View>

        {/* Profile Info */}
        <Card>
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">
                Profil-Informationen
              </Text>
              <Pressable onPress={() => setIsEditing(!isEditing)}>
                <Text className="text-sm font-medium text-primary">
                  {isEditing ? 'Abbrechen' : 'Bearbeiten'}
                </Text>
              </Pressable>
            </View>

            <View className="gap-2">
              <Text className="text-sm text-muted">Name</Text>
              {isEditing ? (
                <TextInput
                  value={profile.name}
                  onChangeText={(text) => setProfile({ ...profile, name: text })}
                  className="text-base text-foreground bg-surface rounded-lg px-3 py-2 border border-border"
                  style={{ outlineStyle: 'none' } as any}
                />
              ) : (
                <Text className="text-base text-foreground">{profile.name}</Text>
              )}
            </View>

            <View className="gap-2">
              <Text className="text-sm text-muted">Geschlecht</Text>
              {isEditing ? (
                <View className="flex-row gap-2">
                  {(['male', 'female', 'other'] as const).map((g) => (
                    <Pressable
                      key={g}
                      onPress={() => setProfile({ ...profile, gender: g })}
                      className={`flex-1 py-2 px-3 rounded-lg border ${
                        profile.gender === g ? 'bg-primary border-primary' : 'bg-surface border-border'
                      }`}
                    >
                      <Text
                        className={`text-center text-sm ${
                          profile.gender === g ? 'text-white font-semibold' : 'text-foreground'
                        }`}
                      >
                        {g === 'male' ? 'Männlich' : g === 'female' ? 'Weiblich' : 'Divers'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text className="text-base text-foreground">
                  {profile.gender === 'male' ? 'Männlich' : profile.gender === 'female' ? 'Weiblich' : profile.gender === 'other' ? 'Divers' : 'Nicht angegeben'}
                </Text>
              )}
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 gap-2">
                <Text className="text-sm text-muted">Alter</Text>
                {isEditing ? (
                  <TextInput
                    value={profile.age?.toString() || ''}
                    onChangeText={(text) => setProfile({ ...profile, age: parseInt(text) || undefined })}
                    keyboardType="numeric"
                    placeholder="25"
                    className="text-base text-foreground bg-surface rounded-lg px-3 py-2 border border-border"
                    style={{ outlineStyle: 'none' } as any}
                  />
                ) : (
                  <Text className="text-base text-foreground">{profile.age || '-'} Jahre</Text>
                )}
              </View>

              <View className="flex-1 gap-2">
                <Text className="text-sm text-muted">
                  Gewicht ({profile.unitSystem === 'metric' ? 'kg' : 'lbs'})
                </Text>
                {isEditing ? (
                  <TextInput
                    value={profile.weight?.toString() || ''}
                    onChangeText={(text) => setProfile({ ...profile, weight: parseFloat(text) || undefined })}
                    keyboardType="decimal-pad"
                    placeholder="70"
                    className="text-base text-foreground bg-surface rounded-lg px-3 py-2 border border-border"
                    style={{ outlineStyle: 'none' } as any}
                  />
                ) : (
                  <Text className="text-base text-foreground">
                    {profile.weight || '-'} {profile.unitSystem === 'metric' ? 'kg' : 'lbs'}
                  </Text>
                )}
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm text-muted">
                Körpergröße ({profile.unitSystem === 'metric' ? 'cm' : 'in'})
              </Text>
              {isEditing ? (
                <TextInput
                  value={profile.height?.toString() || ''}
                  onChangeText={(text) => setProfile({ ...profile, height: parseFloat(text) || undefined })}
                  keyboardType="decimal-pad"
                  placeholder="175"
                  className="text-base text-foreground bg-surface rounded-lg px-3 py-2 border border-border"
                  style={{ outlineStyle: 'none' } as any}
                />
              ) : (
                <Text className="text-base text-foreground">
                  {profile.height || '-'} {profile.unitSystem === 'metric' ? 'cm' : 'in'}
                </Text>
              )}
            </View>

            <View className="gap-2">
              <Text className="text-sm text-muted">
                Zielgewicht ({profile.unitSystem === 'metric' ? 'kg' : 'lbs'})
              </Text>
              {isEditing ? (
                <TextInput
                  value={profile.targetWeight?.toString() || ''}
                  onChangeText={(text) => setProfile({ ...profile, targetWeight: parseFloat(text) || undefined })}
                  keyboardType="decimal-pad"
                  placeholder="65"
                  className="text-base text-foreground bg-surface rounded-lg px-3 py-2 border border-border"
                  style={{ outlineStyle: 'none' } as any}
                />
              ) : (
                <Text className="text-base text-foreground">
                  {profile.targetWeight || '-'} {profile.unitSystem === 'metric' ? 'kg' : 'lbs'}
                </Text>
              )}
            </View>

            {isEditing && (
              <Button variant="primary" onPress={handleSave}>
                Speichern
              </Button>
            )}
          </View>
        </Card>

        {/* Health Stats */}
        {profile.weight && profile.height && profile.age && profile.gender && (
          <Card>
            <View className="gap-4">
              <Text className="text-lg font-semibold text-foreground">
                Gesundheitsdaten
              </Text>
              
              <View className="flex-row gap-3">
                <View className="flex-1 bg-surface rounded-lg p-3">
                  <Text className="text-xs text-muted mb-1">BMI</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {(() => {
                      const { calculateBMI, convertWeight, convertHeight } = require('@/lib/health-calculations');
                      const weightInKg = profile.unitSystem === 'imperial' ? convertWeight(profile.weight!, 'imperial', 'metric') : profile.weight!;
                      const heightInCm = profile.unitSystem === 'imperial' ? convertHeight(profile.height!, 'imperial', 'metric') : profile.height!;
                      return calculateBMI(weightInKg, heightInCm).toFixed(1);
                    })()}
                  </Text>
                  <Text className="text-xs text-muted mt-1">
                    {(() => {
                      const { calculateBMI, getBMICategory, convertWeight, convertHeight } = require('@/lib/health-calculations');
                      const weightInKg = profile.unitSystem === 'imperial' ? convertWeight(profile.weight!, 'imperial', 'metric') : profile.weight!;
                      const heightInCm = profile.unitSystem === 'imperial' ? convertHeight(profile.height!, 'imperial', 'metric') : profile.height!;
                      const bmi = calculateBMI(weightInKg, heightInCm);
                      return getBMICategory(bmi);
                    })()}
                  </Text>
                </View>

                <View className="flex-1 bg-surface rounded-lg p-3">
                  <Text className="text-xs text-muted mb-1">Grundumsatz</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {(() => {
                      const { calculateBMR, convertWeight, convertHeight } = require('@/lib/health-calculations');
                      const weightInKg = profile.unitSystem === 'imperial' ? convertWeight(profile.weight!, 'imperial', 'metric') : profile.weight!;
                      const heightInCm = profile.unitSystem === 'imperial' ? convertHeight(profile.height!, 'imperial', 'metric') : profile.height!;
                      return Math.round(calculateBMR(weightInKg, heightInCm, profile.age!, profile.gender!));
                    })()}
                  </Text>
                  <Text className="text-xs text-muted mt-1">kcal/Tag</Text>
                </View>
              </View>

              <Text className="text-xs text-muted">
                Der Grundumsatz (BMR) ist die Energie, die dein Körper in Ruhe verbraucht.
              </Text>

              <Button
                variant="secondary"
                onPress={() => router.push('/weight-tracking')}
              >
                Gewichtsverlauf anzeigen
              </Button>

              <Button
                variant="secondary"
                onPress={() => router.push('/workout-history')}
              >
                Workout-Historie anzeigen
              </Button>
            </View>
          </Card>
        )}

        {/* Goals */}
        <Card>
          <View className="gap-4">
            <Text className="text-lg font-semibold text-foreground">
              Wöchentliches Ziel
            </Text>
            
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-base text-foreground">
                  Workouts pro Woche
                </Text>
                <View className="flex-row items-center gap-3">
                  <Pressable
                    onPress={() =>
                      setProfile({
                        ...profile,
                        weeklyGoal: Math.max(1, profile.weeklyGoal - 1),
                      })
                    }
                  >
                    <View className="w-8 h-8 rounded-full bg-surface items-center justify-center">
                      <Text className="text-lg text-foreground">-</Text>
                    </View>
                  </Pressable>
                  
                  <Text className="text-xl font-bold text-primary w-8 text-center">
                    {profile.weeklyGoal}
                  </Text>
                  
                  <Pressable
                    onPress={() =>
                      setProfile({
                        ...profile,
                        weeklyGoal: Math.min(14, profile.weeklyGoal + 1),
                      })
                    }
                  >
                    <View className="w-8 h-8 rounded-full bg-surface items-center justify-center">
                      <Text className="text-lg text-foreground">+</Text>
                    </View>
                  </Pressable>
                </View>
              </View>
              
              <Button
                variant="primary"
                size="sm"
                onPress={() => saveUserProfile(profile)}
              >
                Ziel speichern
              </Button>
            </View>
          </View>
        </Card>

        {/* Settings */}
        <Card>
          <View className="gap-4">
            <Text className="text-lg font-semibold text-foreground">
              Einstellungen
            </Text>

            {/* Theme */}
            <View className="gap-3">
              <Text className="text-sm text-muted">Design</Text>
              <View className="flex-row gap-2">
                {(['light', 'dark', 'system'] as ThemeMode[]).map((theme) => {
                  const isSelected = profile.theme === theme;
                  const labels = {
                    light: 'Hell',
                    dark: 'Dunkel',
                    system: 'System',
                  };
                  return (
                    <Pressable
                      key={theme}
                      onPress={() => {
                        const updated = { ...profile, theme };
                        setProfile(updated);
                        saveUserProfile(updated);
                      }}
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
                          {labels[theme]}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Notifications */}
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-1">
                <Text className="text-base text-foreground">Benachrichtigungen</Text>
                <Text className="text-sm text-muted">
                  Erhalte Erinnerungen für deine Workouts
                </Text>
              </View>
              <Switch
                value={profile.notifications}
                onValueChange={(value) => {
                  const updated = { ...profile, notifications: value };
                  setProfile(updated);
                  saveUserProfile(updated);
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Reminders */}
            <View className="flex-row items-center justify-between py-2">
              <View className="flex-1">
                <Text className="text-base text-foreground">Workout-Erinnerungen</Text>
                <Text className="text-sm text-muted">
                  Tägliche Erinnerung zum Trainieren
                </Text>
              </View>
              <Switch
                value={profile.remindersEnabled}
                onValueChange={(value) => {
                  const updated = { ...profile, remindersEnabled: value };
                  setProfile(updated);
                  saveUserProfile(updated);
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Unit System */}
            <View className="gap-2">
              <Text className="text-sm text-muted">Einheiten</Text>
              <View className="flex-row gap-2">
                {(['metric', 'imperial'] as const).map((unit) => {
                  const isSelected = profile.unitSystem === unit;
                  const labels = {
                    metric: 'Metrisch (kg, km)',
                    imperial: 'Imperial (lbs, mi)',
                  };
                  return (
                    <Pressable
                      key={unit}
                      onPress={() => {
                        const updated = { ...profile, unitSystem: unit };
                        setProfile(updated);
                        saveUserProfile(updated);
                      }}
                      style={({ pressed }) => [
                        {
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <View
                        className={`px-4 py-2 rounded-xl border ${
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
                          {labels[unit]}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </Card>

        {/* About */}
        <Card>
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Über die App
            </Text>
            <View className="gap-2">
              <View className="flex-row justify-between py-1">
                <Text className="text-sm text-muted">Version</Text>
                <Text className="text-sm text-foreground">{APP_VERSION}</Text>
              </View>
              <View className="flex-row justify-between py-1">
                <Text className="text-sm text-muted">Build-Datum</Text>
                <Text className="text-sm text-foreground">{BUILD_DATE}</Text>
              </View>
              <View className="flex-row justify-between py-1">
                <Text className="text-sm text-muted">Entwickelt mit</Text>
                <Text className="text-sm text-foreground">React Native & Expo</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Workout Library Update */}
        <Card>
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Workout-Bibliothek
            </Text>
            <Text className="text-sm text-muted">
              Aktualisiere die Workout-Bibliothek, um neue Workouts zu erhalten.
            </Text>
            <Button
              variant="primary"
              onPress={async () => {
                await updateWorkoutsToLatest();
                if (Platform.OS === 'web') {
                  window.alert('Workout-Bibliothek wurde aktualisiert! Bitte wechseln Sie zum Workouts-Tab, um die neuen Workouts zu sehen.');
                } else {
                  Alert.alert(
                    'Aktualisierung erfolgreich',
                    'Die Workout-Bibliothek wurde aktualisiert! Wechseln Sie zum Workouts-Tab, um die neuen Workouts zu sehen.'
                  );
                }
              }}
            >
              Workouts aktualisieren
            </Button>
          </View>
        </Card>

        {/* Data Management */}
        <Card>
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Daten-Management</Text>
            
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Backup & Wiederherstellung</Text>
              <Text className="text-sm text-muted">
                Exportiere alle deine Daten als JSON-Datei oder importiere ein vorheriges Backup.
              </Text>
              <View className="flex-row gap-2">
                <Button
                  variant="primary"
                  onPress={async () => {
                    try {
                      await exportData();
                      if (Platform.OS === 'web') {
                        // Success message not needed on web as download starts
                      } else {
                        Alert.alert('Erfolg', 'Daten wurden exportiert');
                      }
                    } catch (error) {
                      if (Platform.OS === 'web') {
                        window.alert('Fehler beim Exportieren');
                      } else {
                        Alert.alert('Fehler', 'Fehler beim Exportieren');
                      }
                    }
                  }}
                  className="flex-1"
                >
                  Exportieren
                </Button>
                <Button
                  variant="secondary"
                  onPress={async () => {
                    try {
                      const result = await importData();
                      await loadProfile();
                      const message = `Daten erfolgreich importiert!\n\nWorkouts: ${result.workouts}\nAbsolvierte Workouts: ${result.completedWorkouts}\nGewichtseinträge: ${result.weightEntries}\nCheck-ins: ${result.checkIns}\nProfil: ${result.userProfile ? 'Ja' : 'Nein'}`;
                      if (Platform.OS === 'web') {
                        window.alert(message);
                      } else {
                        Alert.alert('Erfolg', message);
                      }
                    } catch (error) {
                      if (Platform.OS === 'web') {
                        window.alert('Fehler beim Importieren');
                      } else {
                        Alert.alert('Fehler', 'Fehler beim Importieren');
                      }
                    }
                  }}
                  className="flex-1"
                >
                  Importieren
                </Button>
              </View>
            </View>

            <View className="gap-2 mt-2">
              <Text className="text-sm font-semibold text-foreground">Papierkorb</Text>
              <Text className="text-sm text-muted">
                Gelöschte Workouts werden 30 Tage lang aufbewahrt und können wiederhergestellt werden.
              </Text>
              <Button
                variant="outline"
                onPress={() => router.push('/trash')}
              >
                Papierkorb anzeigen
              </Button>
            </View>

            <View className="gap-2 mt-2">
              <Text className="text-sm font-semibold text-foreground">Browser-Speicher</Text>
              <Text className="text-sm text-muted">
                Deine App-Daten werden im Browser-Speicher gespeichert. Wenn du deinen Browser-Cache leerst oder die Website-Daten löschst, gehen ALLE deine Workouts, Check-ins und Fortschritte verloren. Erstelle regelmäßig Backups!
              </Text>
            </View>
          </View>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-error/10">
          <View className="gap-3">
            <Text className="text-lg font-semibold text-error">Gefahrenzone</Text>
            <Text className="text-sm text-muted">
              Das Zurücksetzen löscht alle deine Workouts, Check-ins und Fortschritte unwiderruflich.
            </Text>
            <Button variant="outline" onPress={handleResetData}>
              <Text className="text-error">Alle Daten zurücksetzen</Text>
            </Button>
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}
