/**
 * Backup and restore functions for data export/import
 */

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface BackupData {
  version: string;
  exportDate: string;
  data: {
    userProfile?: any;
    checkIns?: any;
    completedWorkouts?: any;
    workouts?: any;
    weightEntries?: any;
  };
}

export interface ImportResult {
  success: boolean;
  itemsRestored: number;
  workouts: number;
  completedWorkouts: number;
  checkIns: number;
  weightEntries: number;
  userProfile: boolean;
}

/**
 * Export all app data as JSON file
 */
export async function exportData(): Promise<void> {
  try {
    // Collect all data from AsyncStorage
    const keys = await AsyncStorage.getAllKeys();
    const fittrackKeys = keys.filter(key => key.startsWith('@fittrack:'));
    const items = await AsyncStorage.multiGet(fittrackKeys);
    
    const data: any = {};
    items.forEach(([key, value]) => {
      if (value) {
        const cleanKey = key.replace('@fittrack:', '');
        try {
          data[cleanKey] = JSON.parse(value);
        } catch {
          data[cleanKey] = value;
        }
      }
    });

    const backup: BackupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data,
    };

    const jsonString = JSON.stringify(backup, null, 2);
    const fileName = `fittrack-backup-${new Date().toISOString().split('T')[0]}.json`;

    if (Platform.OS === 'web') {
      // Web: Download file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Mobile: Save and share file
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, jsonString);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Fehler beim Exportieren der Daten');
  }
}

/**
 * Import data from JSON file
 */
export async function importData(): Promise<ImportResult> {
  try {
    let jsonString: string;

    if (Platform.OS === 'web') {
      // Web: File input
      return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (e: any) => {
          const file = e.target.files[0];
          if (!file) {
            reject(new Error('Keine Datei ausgewählt'));
            return;
          }
          
          const reader = new FileReader();
          reader.onload = async (event) => {
            try {
              jsonString = event.target?.result as string;
              const result = await processImport(jsonString);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
          reader.readAsText(file);
        };
        input.click();
      });
    } else {
      // Mobile: Document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        throw new Error('Import abgebrochen');
      }

      jsonString = await FileSystem.readAsStringAsync(result.assets[0].uri);
      return await processImport(jsonString);
    }
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Fehler beim Importieren der Daten');
  }
}

async function processImport(jsonString: string): Promise<ImportResult> {
  try {
    const backup: BackupData = JSON.parse(jsonString);
    
    if (!backup.version || !backup.data) {
      throw new Error('Ungültiges Backup-Format');
    }

    // Count items for result
    const result: ImportResult = {
      success: false,
      itemsRestored: 0,
      workouts: backup.data.workouts?.length || 0,
      completedWorkouts: backup.data.completedWorkouts?.length || 0,
      checkIns: backup.data.checkIns ? 1 : 0,
      weightEntries: backup.data.weightEntries?.length || 0,
      userProfile: !!backup.data.userProfile,
    };

    // Restore all data to AsyncStorage
    const items: [string, string][] = [];
    Object.entries(backup.data).forEach(([key, value]) => {
      const fullKey = `@fittrack:${key}`;
      items.push([fullKey, JSON.stringify(value)]);
      result.itemsRestored++;
    });

    await AsyncStorage.multiSet(items);
    result.success = true;
    return result;
  } catch (error) {
    console.error('Error processing import:', error);
    throw new Error('Ungültige Backup-Datei');
  }
}
