# FitTrack – Deployment-Anleitung für statische Web-App

## Überblick

FitTrack wurde als **statische Web-App** gebaut. Das bedeutet: Keine Server-Abstürze, keine Abhängigkeiten, keine Konfiguration nötig. Die App läuft vollständig im Browser und speichert alle Daten lokal.

### Warum statisch?

- ✅ Keine HTTP 502-Fehler oder Server-Crashes
- ✅ Läuft überall: Laptop, Tablet, iPhone (als PWA)
- ✅ Schneller Start (keine Build-Zeit beim Laden)
- ✅ Kostenlos zu hosten (viele Optionen verfügbar)
- ✅ Alle Daten bleiben privat auf deinem Gerät

---

## Schritt 1: Web-App lokal testen

Bevor du die App online stellst, teste sie lokal:

```bash
cd /home/ubuntu/fitness_tracker/dist/web
python3 -m http.server 8000
```

Öffne dann: **http://localhost:8000**

Die App sollte sofort laden und funktionieren. Alle deine Daten sind noch da (im Browser-Speicher).

---

## Schritt 2: Deployment-Optionen

Wähle eine dieser Optionen, um die App online zu stellen:

### Option A: GitHub Pages (kostenlos, einfach)

Perfekt für private Nutzung. GitHub Pages hostet statische Websites kostenlos.

**Schritte:**

1. Erstelle ein GitHub-Konto (falls noch nicht vorhanden)
2. Erstelle ein neues Repository: `fittrack-web`
3. Lade den Inhalt von `/dist/web` hoch:
   ```bash
   cd /home/ubuntu/fitness_tracker
   git init
   git add dist/web/*
   git commit -m "FitTrack static web app"
   git remote add origin https://github.com/deinbenutzername/fittrack-web.git
   git push -u origin main
   ```
4. Gehe zu Repository-Einstellungen → Pages
5. Wähle: Source = `main` Branch, Folder = `/dist/web`
6. Speichern – deine App ist jetzt unter `https://deinbenutzername.github.io/fittrack-web/` erreichbar

**Vorteile:** Kostenlos, GitHub kümmert sich um Updates, HTTPS automatisch
**Nachteil:** Öffentlich sichtbar (aber nur du kennst die URL)

### Option B: Netlify (kostenlos, noch einfacher)

Netlify ist spezialisiert auf statische Apps und bietet eine intuitive Oberfläche.

**Schritte:**

1. Gehe zu [netlify.com](https://www.netlify.com)
2. Melde dich an (mit GitHub)
3. Klicke: „Add new site" → „Deploy manually"
4. Ziehe den Ordner `/dist/web` in die Netlify-Oberfläche
5. Fertig – deine App hat eine URL wie `https://fittrack-xyz.netlify.app`

**Vorteile:** Sehr einfach, schnelle Updates, kostenlos
**Nachteil:** Abhängig von Netlify-Service

### Option C: Vercel (kostenlos, für Next.js optimiert)

Ähnlich wie Netlify, aber von den Machern von Next.js.

**Schritte:**

1. Gehe zu [vercel.com](https://vercel.com)
2. Melde dich an (mit GitHub)
3. Klicke: „Add new project"
4. Verbinde dein GitHub-Repository
5. Setze Build-Einstellungen:
   - Build Command: `npx expo export --platform web --output-dir dist/web`
   - Output Directory: `dist/web`
6. Deploy – deine App ist unter `https://fittrack.vercel.app` erreichbar

**Vorteile:** Sehr schnell, automatische Deployments bei Git-Push
**Nachteil:** Erfordert Git-Repository

### Option D: Einfacher Web-Hosting (z.B. Bluehost, SiteGround)

Falls du bereits Web-Hosting hast:

1. Lade den Inhalt von `/dist/web` via FTP/SFTP hoch
2. Stelle sicher, dass `index.html` im Root-Verzeichnis ist
3. Fertig – deine App läuft unter deiner Domain

**Vorteile:** Volle Kontrolle, keine Abhängigkeiten
**Nachteil:** Manueller Upload, erfordert Hosting-Account

### Option E: Lokal auf iPhone (PWA)

Du kannst die App auch lokal auf deinem iPhone speichern, ohne sie online zu stellen:

1. Öffne die Web-App im Safari-Browser
2. Tippe auf das Share-Symbol (↗)
3. Wähle: „Zum Home-Bildschirm"
4. Die App wird wie eine echte App auf deinem Home-Bildschirm angezeigt
5. Alle Daten bleiben auf deinem iPhone (lokal)

**Vorteile:** Völlig privat, funktioniert offline, keine Internetverbindung nötig
**Nachteil:** Nur auf diesem Gerät verfügbar

---

## Schritt 3: Nach dem Deployment

### Daten sichern

Deine App-Daten sind im Browser-Speicher gespeichert. Erstelle regelmäßig Backups:

1. Öffne die App
2. Gehe zu: Profil → Daten-Management → Exportieren
3. Speichere die JSON-Datei an einem sicheren Ort
4. Falls du die App neu installierst, kannst du die Daten über „Importieren" zurückbringen

### Browser-Cache nicht löschen!

⚠️ **Wichtig:** Wenn du deinen Browser-Cache leerst, gehen alle App-Daten verloren. Die Warnung in der App erinnert dich daran.

### Updates

Falls du die App aktualisieren möchtest (neue Features, Bug-Fixes):

1. Baue die neue Version: `npx expo export --platform web --output-dir dist/web`
2. Lade die neuen Dateien auf deinen Hosting-Service hoch
3. Deine Daten bleiben erhalten (sie sind im Browser-Speicher, nicht auf dem Server)

---

## Schritt 4: Häufig gestellte Fragen

**F: Sind meine Daten sicher?**
A: Ja. Alle Daten bleiben auf deinem Gerät im Browser-Speicher. Kein Server speichert deine Workouts oder Gewichtsdaten.

**F: Funktioniert die App offline?**
A: Ja, aber nur wenn du sie vorher online geöffnet hast (Browser-Cache). Nach dem ersten Laden funktioniert sie auch ohne Internetverbindung.

**F: Kann ich die App auf mehreren Geräten nutzen?**
A: Nicht automatisch. Jedes Gerät hat seinen eigenen Browser-Speicher. Du kannst aber Backups exportieren und auf anderen Geräten importieren.

**F: Was passiert, wenn der Hosting-Service down ist?**
A: Die App funktioniert nicht, bis der Service wieder online ist. Deshalb empfehlen wir etablierte Services wie GitHub Pages oder Netlify.

**F: Kann ich die App auf Android nutzen?**
A: Ja, genauso wie auf iPhone. Öffne die URL im Chrome-Browser und speichere sie auf dem Home-Bildschirm.

---

## Schritt 5: Schnellstart-Befehl

Falls du die App schnell lokal testen möchtest:

```bash
cd /home/ubuntu/fitness_tracker/dist/web && python3 -m http.server 8000
```

Dann öffne: **http://localhost:8000**

---

## Technische Details

| Aspekt | Details |
|--------|---------|
| **Größe** | ~2.5 MB (JavaScript + CSS + Assets) |
| **Browser-Kompatibilität** | Chrome, Safari, Firefox, Edge (alle modernen Versionen) |
| **Speicher** | Browser LocalStorage (üblicherweise 5-10 MB pro Domain) |
| **Offline-Modus** | Ja, nach dem ersten Laden |
| **Daten-Synchronisation** | Keine (lokal nur) |
| **SSL/HTTPS** | Empfohlen (GitHub Pages, Netlify, Vercel bieten es kostenlos) |

---

## Support

Falls Probleme auftreten:

1. **App lädt nicht:** Browser-Cache leeren und neu laden
2. **Daten weg:** Backup-Datei importieren (falls vorhanden)
3. **Langsam:** Browser-Speicher ist voll – alte Daten löschen oder Backup exportieren

---

## Nächste Schritte

1. Wähle eine Deployment-Option (GitHub Pages oder Netlify empfohlen)
2. Folge den Schritten für deine Wahl
3. Teste die App auf deinem Gerät
4. Speichere die App auf deinem Home-Bildschirm (PWA)
5. Erstelle regelmäßig Backups

Viel Erfolg mit FitTrack! 🎯
