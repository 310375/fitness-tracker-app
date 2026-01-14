import { Text, View, Pressable, type PressableProps, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { cn } from '@/lib/utils';

export interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
}

/**
 * A button component with haptic feedback and consistent styling
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  textClassName,
  children,
  onPress,
  disabled,
  ...props
}: ButtonProps) {
  const handlePress = (event: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  const sizeStyles = {
    sm: 'h-10 px-4',
    md: 'h-12 px-6',
    lg: 'h-14 px-8',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const variantStyles = {
    primary: 'bg-primary',
    secondary: 'bg-surface border border-border',
    outline: 'border-2 border-primary bg-transparent',
    ghost: 'bg-transparent',
  };

  const textVariantStyles = {
    primary: 'text-white font-semibold',
    secondary: 'text-foreground font-medium',
    outline: 'text-primary font-semibold',
    ghost: 'text-foreground font-medium',
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          transform: [{ scale: pressed ? 0.97 : 1 }],
          opacity: pressed ? 0.9 : disabled ? 0.5 : 1,
        },
      ]}
      {...props}
    >
      <View
        className={cn(
          'rounded-xl items-center justify-center',
          sizeStyles[size],
          variantStyles[variant],
          disabled && 'opacity-50',
          className
        )}
      >
        <Text
          className={cn(
            textSizeStyles[size],
            textVariantStyles[variant],
            textClassName
          )}
        >
          {children}
        </Text>
      </View>
    </Pressable>
  );
}
