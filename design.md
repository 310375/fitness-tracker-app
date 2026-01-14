# Fitness Tracker - Mobile App Interface Design

## Design-Philosophie

Die Fitness-Tracking-App folgt den **Apple Human Interface Guidelines (HIG)** und orientiert sich an iOS-nativen Fitness-Apps wie Apple Fitness und Nike Training Club. Das Design ist für **mobile Portrait-Orientierung (9:16)** und **einhändige Bedienung** optimiert.

## Farbschema

**Primärfarbe**: `#FF6B35` (Energetisches Orange) - für CTAs, aktive Zustände, Fortschrittsbalken
**Hintergrund (Hell)**: `#FFFFFF` - sauberer, minimalistischer Look
**Hintergrund (Dunkel)**: `#1A1A1A` - augenschonend für Workouts
**Oberfläche (Hell)**: `#F8F9FA` - Cards und Container
**Oberfläche (Dunkel)**: `#2A2A2A` - erhöhte Elemente
**Text (Hell)**: `#1A1A1A` - primärer Text
**Text (Dunkel)**: `#FFFFFF` - primärer Text
**Sekundärtext**: `#6B7280` - Labels, Metadaten
**Erfolg**: `#10B981` - abgeschlossene Workouts
**Warnung**: `#F59E0B` - Pausen, Warnungen
**Fehler**: `#EF4444` - Fehler, kritische Hinweise

## Screen-Liste

### 1. Home Screen (Tab 1)
**Hauptinhalt**:
- Hero-Bereich mit Begrüßung und aktuellem Datum
- Täglicher Check-in Status (Streak-Anzeige mit Feuer-Icon)
- "Heutiges Workout"-Card mit Quick-Start-Button
- Wöchentliche Fortschrittsübersicht (Balkendiagramm, 7 Tage)
- Schnellzugriff-Buttons: "Workout starten", "Check-in durchführen"

**Funktionalität**:
- Täglichen Check-in durchführen (einmal pro Tag)
- Workout direkt starten
- Fortschritt auf einen Blick sehen

### 2. Workouts Screen (Tab 2)
**Hauptinhalt**:
- Kategorien-Filter (Alle, Kraft, Cardio, Flexibilität, HIIT)
- Workout-Liste als Cards mit:
  - Workout-Name und Icon
  - Dauer und Schwierigkeitsgrad
  - Anzahl der Übungen
  - "Start"-Button
- Suchfunktion oben

**Funktionalität**:
- Workouts nach Kategorie filtern
- Workout-Details anzeigen (Modal)
- Workout starten → Workout-Session-Screen

### 3. Workout-Session Screen (Modal/Full-Screen)
**Hauptinhalt**:
- Großer Timer (Countdown für Übung/Pause)
- Aktuelle Übung mit Illustration/Icon
- Fortschrittsbalken (X von Y Übungen)
- Nächste Übung Preview
- Pause/Fortsetzen/Abbrechen-Buttons

**Funktionalität**:
- Timer für jede Übung
- Automatischer Übergang zur nächsten Übung
- Pause-Modus
- Workout abschließen → Zusammenfassung

### 4. Fortschritt Screen (Tab 3)
**Hauptinhalt**:
- Zeitraum-Selector (Woche, Monat, Jahr)
- Statistik-Cards:
  - Gesamte Workouts
  - Aktuelle Streak
  - Gesamtzeit trainiert
  - Kalorien verbrannt (geschätzt)
- Liniendiagramm: Workouts pro Zeitraum
- Kalender-Heatmap (ähnlich GitHub Contributions)

**Funktionalität**:
- Historische Daten visualisieren
- Trends erkennen
- Motivation durch Streaks

### 5. Profil Screen (Tab 4)
**Hauptinhalt**:
- Profilbild und Name (optional)
- Persönliche Ziele (Workouts pro Woche)
- Einstellungen:
  - Theme (Hell/Dunkel/System)
  - Benachrichtigungen
  - Workout-Erinnerungen
  - Einheiten (kg/lbs, km/mi)
- Über die App

**Funktionalität**:
- Benutzerprofil verwalten
- Ziele setzen
- App-Einstellungen anpassen

## Key User Flows

### Flow 1: Täglicher Check-in
1. User öffnet App → Home Screen
2. User sieht "Check-in durchführen"-Card
3. User tippt auf "Check-in"-Button
4. Haptic Feedback + Animation
5. Check-in wird gespeichert (AsyncStorage)
6. Streak-Counter erhöht sich
7. Erfolgs-Toast erscheint

### Flow 2: Workout starten und abschließen
1. User navigiert zu Workouts Tab
2. User wählt Workout aus Liste
3. Workout-Details-Modal öffnet sich
4. User tippt "Workout starten"
5. Full-Screen Workout-Session beginnt
6. Timer läuft für jede Übung
7. User kann pausieren/fortsetzen
8. Nach letzter Übung: Zusammenfassung
9. Workout wird in Historie gespeichert
10. User kehrt zum Home Screen zurück

### Flow 3: Fortschritt überprüfen
1. User navigiert zu Fortschritt Tab
2. User sieht aktuelle Statistiken
3. User wählt Zeitraum (z.B. Monat)
4. Diagramme aktualisieren sich
5. User scrollt durch Kalender-Heatmap
6. User sieht detaillierte Tage bei Tap

## Layout-Spezifikationen

### Tab Bar (Bottom Navigation)
- 4 Tabs: Home, Workouts, Fortschritt, Profil
- Icons: SF Symbols (house.fill, figure.run, chart.bar.fill, person.fill)
- Aktive Tab: Primärfarbe
- Inaktive Tabs: Grau (#9CA3AF)
- Höhe: 56px + Safe Area Bottom

### Cards
- Border-Radius: 16px
- Padding: 16px
- Shadow: leicht (elevation 2)
- Spacing: 12px zwischen Cards

### Buttons
- Primär: Gefüllt mit Primärfarbe, weißer Text
- Sekundär: Outline mit Primärfarbe
- Border-Radius: 12px
- Höhe: 48px (leicht erreichbar mit Daumen)
- Haptic Feedback bei Tap

### Typography
- Headline: 28px, Bold
- Title: 20px, Semibold
- Body: 16px, Regular
- Caption: 14px, Regular
- Line-Height: 1.4x

## Interaktions-Design

### Feedback
- **Button-Tap**: Scale 0.97 + Light Haptic
- **Check-in**: Medium Haptic + Success Animation
- **Workout-Start**: Medium Haptic + Countdown-Animation
- **Workout-Complete**: Success Haptic + Konfetti-Animation

### Animationen
- Transition-Dauer: 250ms
- Easing: ease-in-out
- Card-Hover: leichte Scale (1.02)
- Modal-Erscheinen: Slide-up von unten

## Datenstruktur (AsyncStorage)

```typescript
// User-Profil
{
  name: string;
  weeklyGoal: number; // Workouts pro Woche
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
}

// Check-ins
{
  checkIns: string[]; // ISO-Datumsstrings ['2026-01-14', '2026-01-15']
  currentStreak: number;
  longestStreak: number;
}

// Workout-Historie
{
  completedWorkouts: Array<{
    id: string;
    workoutId: string;
    workoutName: string;
    date: string; // ISO-String
    duration: number; // Minuten
    caloriesBurned: number; // geschätzt
  }>;
}

// Vordefinierte Workouts
{
  workouts: Array<{
    id: string;
    name: string;
    category: 'strength' | 'cardio' | 'flexibility' | 'hiit';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number; // Minuten
    exercises: Array<{
      name: string;
      duration: number; // Sekunden
      rest: number; // Sekunden Pause danach
    }>;
  }>;
}
```

## Accessibility

- Mindestgröße für Touch-Targets: 44x44px
- Kontrastverhältnis: mindestens 4.5:1
- VoiceOver-Unterstützung für alle interaktiven Elemente
- Dynamic Type Support für Textgrößen

## Performance-Ziele

- App-Start: < 2 Sekunden
- Screen-Transition: < 300ms
- Smooth 60fps Animationen
- Offline-First: Alle Daten lokal gespeichert
