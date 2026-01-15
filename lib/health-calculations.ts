/**
 * Health and fitness calculation utilities
 */

import type { UserProfile } from './types';

/**
 * Calculate BMI (Body Mass Index)
 * @param weight in kg
 * @param height in cm
 * @returns BMI value
 */
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Untergewicht';
  if (bmi < 25) return 'Normalgewicht';
  if (bmi < 30) return 'Übergewicht';
  return 'Adipositas';
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 * @param weight in kg
 * @param height in cm
 * @param age in years
 * @param gender 'male' or 'female'
 * @returns BMR in calories per day
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female' | 'other'
): number {
  // Mifflin-St Jeor Equation
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  
  if (gender === 'male') {
    return baseBMR + 5;
  } else if (gender === 'female') {
    return baseBMR - 161;
  } else {
    // Average for 'other'
    return baseBMR - 78;
  }
}

/**
 * Calculate calories burned during workout based on user profile
 * Uses MET (Metabolic Equivalent of Task) values
 * @param durationMinutes workout duration in minutes
 * @param profile user profile with weight and other data
 * @param intensity 'low' | 'medium' | 'high'
 * @returns estimated calories burned
 */
export function calculateCaloriesBurned(
  durationMinutes: number,
  profile: UserProfile | null,
  intensity: 'low' | 'medium' | 'high' = 'medium'
): number {
  // Default weight if not provided
  const weight = profile?.weight || 70;
  
  // Convert to kg if using imperial system
  const weightInKg = profile?.unitSystem === 'imperial' ? weight * 0.453592 : weight;
  
  // MET values for different intensities
  const metValues = {
    low: 3.5,      // Light exercise
    medium: 6.0,   // Moderate exercise
    high: 8.5,     // Vigorous exercise
  };
  
  const met = metValues[intensity];
  
  // Calories = MET * weight (kg) * duration (hours)
  return Math.round(met * weightInKg * (durationMinutes / 60));
}

/**
 * Convert weight between metric and imperial
 */
export function convertWeight(weight: number, fromSystem: 'metric' | 'imperial', toSystem: 'metric' | 'imperial'): number {
  if (fromSystem === toSystem) return weight;
  
  if (fromSystem === 'metric' && toSystem === 'imperial') {
    // kg to lbs
    return weight * 2.20462;
  } else {
    // lbs to kg
    return weight * 0.453592;
  }
}

/**
 * Convert height between metric and imperial
 */
export function convertHeight(height: number, fromSystem: 'metric' | 'imperial', toSystem: 'metric' | 'imperial'): number {
  if (fromSystem === toSystem) return height;
  
  if (fromSystem === 'metric' && toSystem === 'imperial') {
    // cm to inches
    return height * 0.393701;
  } else {
    // inches to cm
    return height * 2.54;
  }
}
