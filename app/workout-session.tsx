import { View, Text, Pressable, Platform, Modal } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '@/components/screen-container';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { getWorkouts, saveCompletedWorkout } from '@/lib/storage';
import { estimateCalories, getWorkoutIntensity } from '@/lib/stats';
import type { Workout, Exercise } from '@/lib/types';

type WorkoutState = 'ready' | 'exercise' | 'rest' | 'paused' | 'completed';

export default function WorkoutSessionScreen() {
  useKeepAwake(); // Keep screen awake during workout
  
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [state, setState] = useState<WorkoutState>('ready');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    loadWorkout();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (state === 'exercise' || state === 'rest') {
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [state]);

  const loadWorkout = async () => {
    const workouts = await getWorkouts();
    const found = workouts.find((w) => w.id === id);
    if (found) {
      setWorkout(found);
    }
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
      setTotalElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTimerComplete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    if (state === 'exercise') {
      // Move to rest period
      const currentExercise = workout?.exercises[currentExerciseIndex];
      if (currentExercise && currentExercise.rest > 0) {
        setState('rest');
        setTimeRemaining(currentExercise.rest);
      } else {
        moveToNextExercise();
      }
    } else if (state === 'rest') {
      moveToNextExercise();
    }
  };

  const moveToNextExercise = () => {
    if (!workout) return;

    if (currentExerciseIndex < workout.exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setState('exercise');
      setTimeRemaining(workout.exercises[nextIndex].duration);
    } else {
      // Workout completed
      setState('completed');
      completeWorkout();
    }
  };

  const handleStart = () => {
    if (!workout || workout.exercises.length === 0) return;
    startTimeRef.current = Date.now();
    setState('exercise');
    setTimeRemaining(workout.exercises[0].duration);
  };

  const handlePause = () => {
    setState('paused');
  };

  const handleResume = () => {
    setState(state === 'rest' ? 'rest' : 'exercise');
  };

  const handleSkip = () => {
    if (state === 'exercise') {
      const currentExercise = workout?.exercises[currentExerciseIndex];
      if (currentExercise && currentExercise.rest > 0) {
        setState('rest');
        setTimeRemaining(currentExercise.rest);
      } else {
        moveToNextExercise();
      }
    } else {
      moveToNextExercise();
    }
  };

  const handleExit = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    router.back();
  };

  const completeWorkout = async () => {
    if (!workout) return;

    const durationMinutes = Math.round(totalElapsedTime / 60);
    const intensity = getWorkoutIntensity(workout.category);
    const calories = estimateCalories(durationMinutes, intensity);

    await saveCompletedWorkout({
      id: `completed-${Date.now()}`,
      workoutId: workout.id,
      workoutName: workout.name,
      date: new Date().toISOString(),
      duration: durationMinutes,
      caloriesBurned: calories,
      exercises: workout.exercises.length,
    });

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleFinish = () => {
    router.back();
  };

  if (!workout) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-muted">Workout wird geladen...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];
  const nextExercise = workout.exercises[currentExerciseIndex + 1];
  const progress = ((currentExerciseIndex + 1) / workout.exercises.length) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <Pressable onPress={handleExit}>
              <IconSymbol name="chevron.right" size={28} color={colors.foreground} />
            </Pressable>
            <Text className="text-base font-semibold text-foreground">
              {workout.name}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Progress Bar */}
          <View className="h-1 bg-surface rounded-full overflow-hidden">
            <View
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
          <Text className="text-sm text-muted text-center mt-2">
            Übung {currentExerciseIndex + 1} von {workout.exercises.length}
          </Text>
        </View>

        {/* Main Content */}
        <View className="flex-1 items-center justify-center px-6">
          {state === 'ready' ? (
            <View className="items-center gap-6">
              <Text className="text-3xl font-bold text-foreground text-center">
                Bereit zum Start?
              </Text>
              <Text className="text-base text-muted text-center">
                {workout.exercises.length} Übungen • {workout.duration} Minuten
              </Text>
              <Button variant="primary" size="lg" onPress={handleStart}>
                Workout starten
              </Button>
            </View>
          ) : state === 'completed' ? (
            <View className="items-center gap-6">
              <Text className="text-5xl mb-4">🎉</Text>
              <Text className="text-3xl font-bold text-foreground text-center">
                Glückwunsch!
              </Text>
              <Text className="text-base text-muted text-center">
                Du hast das Workout abgeschlossen
              </Text>
              <View className="gap-2 items-center">
                <Text className="text-lg text-foreground">
                  Zeit: {formatTime(totalElapsedTime)}
                </Text>
                <Text className="text-lg text-foreground">
                  Übungen: {workout.exercises.length}
                </Text>
              </View>
              <Button variant="primary" size="lg" onPress={handleFinish}>
                Fertig
              </Button>
            </View>
          ) : (
            <>
              {/* Timer Display */}
              <View className="items-center gap-4 mb-8">
                <Text
                  className={`text-7xl font-bold ${
                    state === 'rest' ? 'text-warning' : 'text-primary'
                  }`}
                >
                  {formatTime(timeRemaining)}
                </Text>
                <Text className="text-xl text-muted">
                  {state === 'rest' ? 'Pause' : 'Übung'}
                </Text>
              </View>

              {/* Current Exercise */}
              <View className="items-center gap-2 mb-8">
                <Text className="text-3xl font-bold text-foreground text-center">
                  {currentExercise.name}
                </Text>
                {state === 'paused' && (
                  <Text className="text-base text-warning">Pausiert</Text>
                )}
              </View>

              {/* Next Exercise Preview */}
              {nextExercise && state !== 'rest' && (
                <View className="items-center gap-1">
                  <Text className="text-sm text-muted">Als nächstes:</Text>
                  <Text className="text-base text-foreground">
                    {nextExercise.name}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Controls */}
        {state !== 'ready' && state !== 'completed' && (
          <View className="px-6 pb-8 gap-3">
            {state === 'paused' ? (
              <Button variant="primary" size="lg" onPress={handleResume}>
                Fortsetzen
              </Button>
            ) : (
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Button variant="outline" size="lg" onPress={handlePause}>
                    Pause
                  </Button>
                </View>
                <View className="flex-1">
                  <Button variant="secondary" size="lg" onPress={handleSkip}>
                    Überspringen
                  </Button>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Exit Confirmation Modal */}
      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-background rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-foreground mb-2">
              Workout beenden?
            </Text>
            <Text className="text-base text-muted mb-6">
              Dein Fortschritt geht verloren, wenn du jetzt abbrichst.
            </Text>
            <View className="gap-3">
              <Button variant="primary" onPress={confirmExit}>
                Ja, beenden
              </Button>
              <Button variant="outline" onPress={() => setShowExitModal(false)}>
                Weiter trainieren
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
