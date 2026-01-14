import { View, Text, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Card } from './card';
import { IconSymbol } from './icon-symbol';
import { useColors } from '@/hooks/use-colors';
import type { Workout } from '@/lib/types';

export interface WorkoutCardProps {
  workout: Workout;
  onPress: () => void;
}

const categoryIcons: Record<string, string> = {
  strength: 'fitness-center',
  cardio: 'directions-run',
  flexibility: 'self-improvement',
  hiit: 'whatshot',
};

const difficultyColors: Record<string, string> = {
  beginner: '#10B981',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
};

/**
 * A card component for displaying workout information
 */
export function WorkoutCard({ workout, onPress }: WorkoutCardProps) {
  const colors = useColors();

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const categoryIcon = categoryIcons[workout.category] || 'fitness-center';
  const difficultyColor = difficultyColors[workout.difficulty] || colors.muted;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Card>
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-xl bg-primary/10 items-center justify-center">
            <IconSymbol name={categoryIcon as any} size={24} color={colors.primary} />
          </View>
          
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground mb-1">
              {workout.name}
            </Text>
            <View className="flex-row items-center gap-3">
              <Text className="text-sm text-muted">
                {workout.duration} Min
              </Text>
              <View className="w-1 h-1 rounded-full bg-muted" />
              <Text className="text-sm text-muted">
                {workout.exercises.length} Übungen
              </Text>
              <View className="w-1 h-1 rounded-full bg-muted" />
              <View className="flex-row items-center gap-1">
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: difficultyColor }}
                />
                <Text className="text-sm text-muted capitalize">
                  {workout.difficulty}
                </Text>
              </View>
            </View>
          </View>

          <IconSymbol name="chevron.right" size={20} color={colors.muted} />
        </View>
      </Card>
    </Pressable>
  );
}
