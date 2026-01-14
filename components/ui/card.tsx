import { View, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

export interface CardProps extends ViewProps {
  className?: string;
}

/**
 * A reusable card component with consistent styling
 */
export function Card({ className, children, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'bg-surface rounded-2xl p-4 border border-border',
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}
