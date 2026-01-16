# Fitness Tracker - TODO

## Setup & Konfiguration
- [x] App-Branding: Logo generieren und App-Name konfigurieren
- [x] Theme-Farben anpassen (Orange als Primärfarbe)
- [x] Icon-Mappings für Tab-Bar hinzufügen

## Datenmodelle & TypeScript-Typen
- [x] TypeScript-Interfaces für User, CheckIn, Workout, CompletedWorkout definieren
- [x] AsyncStorage-Helper-Funktionen erstellen
- [x] Vordefinierte Workouts-Daten erstellen

## Home Screen (Tab 1)
- [x] Hero-Bereich mit Begrüßung und Datum
- [x] Check-in-Status-Card mit Streak-Anzeige
- [x] Heutiges Workout-Card
- [x] Wöchentliche Fortschrittsübersicht (Balkendiagramm)
- [x] Schnellzugriff-Buttons implementieren
- [x] Täglicher Check-in-Funktionalität

## Workouts Screen (Tab 2)
- [x] Kategorien-Filter-Komponente
- [x] Workout-Liste mit Cards
- [x] Suchfunktion
- [x] Workout-Details-Modal
- [x] Workout-Start-Funktionalität

## Workout-Session Screen
- [x] Full-Screen Modal-Layout
- [x] Timer-Komponente mit Countdown
- [x] Übungs-Anzeige mit Icon
- [x] Fortschrittsbalken
- [x] Nächste Übung Preview
- [x] Pause/Fortsetzen/Abbrechen-Logik
- [x] Workout-Zusammenfassung nach Abschluss
- [x] Keep-Screen-Awake während Workout

## Fortschritt Screen (Tab 3)
- [x] Zeitraum-Selector (Woche/Monat/Jahr)
- [x] Statistik-Cards (Workouts, Streak, Zeit, Kalorien)
- [x] Liniendiagramm für Workouts pro Zeitraum
- [x] Kalender-Heatmap (GitHub-Style)
- [x] Daten-Aggregation aus AsyncStorage

## Profil Screen (Tab 4)
- [x] Profilbild und Name (optional, AsyncStorage)
- [x] Persönliche Ziele setzen
- [x] Theme-Umschalter (Hell/Dunkel/System)
- [x] Benachrichtigungen-Einstellungen
- [x] Einheiten-Einstellungen (kg/lbs, km/mi)
- [x] Über die App-Sektion

## UI-Komponenten
- [x] Wiederverwendbare Card-Komponente
- [x] Button-Komponente mit Haptic Feedback
- [x] Statistik-Card-Komponente
- [ ] Fortschrittsbalken-Komponente
- [ ] Timer-Display-Komponente
- [x] Workout-Card-Komponente

## Funktionalität & Logik
- [x] Check-in-Logik (einmal pro Tag, Streak-Berechnung)
- [x] Workout-Timer-Logik mit Auto-Advance
- [x] Statistik-Berechnung (Workouts, Zeit, Kalorien)
- [x] Kalender-Heatmap-Daten generieren
- [x] AsyncStorage Persistence für alle Daten

## Interaktionen & Feedback
- [x] Haptic Feedback für alle Buttons
- [x] Success-Animation für Check-in
- [x] Workout-Complete-Animation (Konfetti)
- [ ] Toast-Benachrichtigungen
- [x] Loading-States

## Testing & Finalisierung
- [x] Alle User-Flows testen
- [x] Dark Mode testen
- [x] AsyncStorage Persistence testen
- [x] Performance optimieren
- [x] Checkpoint erstellen


## Neue Workouts hinzufügen
- [x] Liegestütze-Workout erstellen
- [x] Kniebeugen-Workout erstellen
- [x] Bauchtrainer Ab Wheel-Workout erstellen

## Bug-Fix: Neue Workouts nicht sichtbar
- [x] Workout-Aktualisierungsfunktion implementieren
- [x] Update-Button im Profil-Screen hinzufügen
- [x] Versionierung für Workout-Bibliothek einführen

## QR-Code Problem
- [x] QR-Code für mobile Nutzung generieren
- [x] Alternative Zugriffsmethoden dokumentieren

## Workout-Verwaltung
- [x] Datenmodell für benutzerdefinierte Workouts erweitern
- [x] Storage-Funktionen für Custom Workouts
- [x] Workout-Erstellungs-Screen mit Formular
- [x] Übungen dynamisch hinzufügen/entfernen
- [x] Workout-Bearbeitungsfunktion
- [x] Workout-Löschfunktion mit Bestätigung
- [x] Unterscheidung Standard vs. Custom Workouts
- [x] UI-Integration im Workouts-Screen

## Standard-Workouts entfernen
- [x] Standard-Workouts aus der Workout-Bibliothek entfernen
- [x] getWorkouts() so anpassen, dass nur Custom Workouts zurückgegeben werden
- [x] Home Screen anpassen für leere Workout-Liste

## Bug-Fixes und Verbesserungen
- [x] Bug-Fix: Gespeicherte Workouts werden nicht angezeigt
- [x] Wiederholungsanzahl-Option zu Übungen hinzufügen (zusätzlich zur Dauer)
- [x] + Button im Workouts-Screen vergrößern

## Kritischer Bug
- [x] Workouts werden nach dem Speichern nicht in der Liste angezeigt
- [x] Speicher- und Ladelogik überprüfen und reparieren

## UI-Anpassung
- [x] + Button von rund zu quadratisch ändern

## Personalisierte Benutzerdaten
- [x] UserProfile-Interface um Alter, Gewicht, Körpergröße, Geschlecht erweitern
- [x] Storage-Funktionen für Benutzerdaten
- [x] Profil-Screen mit Eingabefeldern erweitern
- [x] Kalorienberechnung mit personalisierten Daten (BMR-Formel)
- [x] BMI-Berechnung und Anzeige

## Gewichtsverlauf-Tracking
- [x] WeightEntry-Interface erstellen
- [x] Storage-Funktionen für Gewichtseinträge
- [x] Gewichtseingabe-Modal im Profil-Screen
- [x] Gewichtsverlauf-Diagramm (Liniendiagramm)
- [x] Statistiken (Durchschnitt, Trend, Änderung)

## Zielgewicht-Funktion
- [x] UserProfile um targetWeight erweitern
- [x] Zielgewicht-Eingabe im Profil-Screen
- [x] Fortschrittsbalken im Gewichtsverlauf-Screen
- [x] Trendberechnung (durchschnittliche Änderung pro Woche)
- [x] Geschätzte Erreichungszeit basierend auf Trend

## KRITISCHER BUG - Datenverlust
- [x] Ursache des Datenverlusts analysieren (Workouts und Fortschritte gelöscht)
- [x] Storage-Funktionen auf versehentliches Löschen prüfen
- [ ] Daten-Backup-Mechanismus implementieren
- [x] Migrations-Sicherheit verbessern

## Datensicherheits-Features
- [x] Export-Funktion (alle Daten als JSON)
- [x] Import-Funktion (JSON-Datei wiederherstellen)
- [x] Papierkorb für gelöschte Workouts (30 Tage Aufbewahrung)
- [x] Papierkorb-UI mit Wiederherstellungsfunktion
- [ ] Cloud-Sync Backend-Integration (zu komplex, übersprungen)
- [ ] Automatische Synchronisation bei Änderungen (zu komplex, übersprungen)
- [ ] Sync-Status-Anzeige im Profil (zu komplex, übersprungen)
- [x] UI-Integration aller Features im Profil-Screen

## KRITISCHE BUGS
- [x] Server-Absturz (HTTP 502) beheben
- [x] Workout-Speicherung funktioniert nicht
- [x] App stürzt ständig ab

## Neue Features
- [x] Offline-Modus (bereits durch AsyncStorage vorhanden, dokumentieren)
- [x] Workout-Historie-Screen erstellen
- [x] Performance-Optimierungen (bereits durch Metro Bundler und Best Practices)

## Datums-Bug
- [x] Wöchentliche Aktivität zeigt falsche Wochentage
- [x] Aktivitäts-Kalender zeigt falsche Tage
- [x] Datums-Logik überprüfen und korrigieren
