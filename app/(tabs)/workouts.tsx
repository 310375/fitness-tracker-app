import { ScrollView, Text, View, TextInput, Pressable, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { WorkoutCard } from '@/components/ui/workout-card';
import { useColors } from '@/hooks/use-colors';
import { getWorkouts } from '@/lib/storage';
import type { Workout, WorkoutCategory } from '@/lib/types';

const categories: { id: WorkoutCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'strength', label: 'Kraft' },
  { id: 'cardio', label: 'Cardio' },
  { id: 'flexibility', label: 'Flexibilität' },
  { id: 'hiit', label: 'HIIT' },
];

export default function WorkoutsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    filterWorkouts();
  }, [workouts, selectedCategory, searchQuery]);

  const loadWorkouts = async () => {
    const data = await getWorkouts();
    setWorkouts(data);
  };

  const filterWorkouts = () => {
    let filtered = workouts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((w) => w.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.name.toLowerCase().includes(query) ||
          w.description?.toLowerCase().includes(query)
      );
    }

    setFilteredWorkouts(filtered);
  };

  const handleWorkoutPress = (workout: Workout) => {
    // Navigate to workout detail/session
    router.push(`/workout-session?id=${workout.id}`);
  };

  return (
    <ScreenContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="px-4 pt-4 pb-3">
          <Text className="text-3xl font-bold text-foreground mb-4">Workouts</Text>

          {/* Search Bar */}
          <View className="bg-surface rounded-xl px-4 py-3 border border-border mb-4">
            <TextInput
              placeholder="Workout suchen..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="text-base text-foreground"
              style={{ outlineStyle: 'none' } as any}
            />
          </View>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <Pressable
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
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
                      {category.label}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Workouts List */}
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, gap: 12 }}
        >
          {filteredWorkouts.length > 0 ? (
            filteredWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onPress={() => handleWorkoutPress(workout)}
              />
            ))
          ) : (
            <View className="items-center justify-center py-12">
              <Text className="text-base text-muted text-center">
                {searchQuery
                  ? 'Keine Workouts gefunden'
                  : 'Keine Workouts in dieser Kategorie'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
