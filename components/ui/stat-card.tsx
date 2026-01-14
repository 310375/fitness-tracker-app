import { View, Text } from 'react-native';
import { Card } from './card';
import { IconSymbol } from './icon-symbol';
import { useColors } from '@/hooks/use-colors';

export interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}

/**
 * A card component for displaying statistics
 */
export function StatCard({ icon, label, value, unit, color }: StatCardProps) {
  const colors = useColors();
  const iconColor = color || colors.primary;

  return (
    <Card className="flex-1 min-w-[140px]">
      <View className="gap-2">
        <IconSymbol name={icon as any} size={24} color={iconColor} />
        <Text className="text-2xl font-bold text-foreground">
          {value}
          {unit && <Text className="text-base text-muted"> {unit}</Text>}
        </Text>
        <Text className="text-sm text-muted">{label}</Text>
      </View>
    </Card>
  );
}
