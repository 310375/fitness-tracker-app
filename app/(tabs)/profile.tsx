import { ScrollView, Text, View, TextInput, Switch, Pressable, Alert, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getUserProfile, saveUserProfile, clearAllData, updateWorkoutsToLatest } from '@/lib/storage';
import type { UserProfile, ThemeMode } from '@/lib/types';

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

            {isEditing && (
              <Button variant="primary" onPress={handleSave}>
                Speichern
              </Button>
            )}
          </View>
        </Card>

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
                <Text className="text-sm text-foreground">1.0.0</Text>
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

        {/* Danger Zone */}
        <Card className="border-error/30">
          <View className="gap-3">
            <Text className="text-lg font-semibold text-error">
              Gefahrenzone
            </Text>
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
