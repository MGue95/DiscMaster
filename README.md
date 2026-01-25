# 💿 DiscMaster

**DiscMaster** ist eine moderne, hochperformante Web-Anwendung zur Verwaltung deiner Vinyl-Sammlung, basierend auf der Discogs-Datenbank und erweitert um Spotify-Integration.

![DiscMaster UI Preview](/public/images/ui-preview.png)

## ✨ Features

- **🚀 Ultra-Responsive UI**: Dunkles Premium-Design mit Glasmorphismus-Effekten.
- **🔍 AJAX-Suche**: Live-Suchvorschläge mit Cover-Art direkt auf der Startseite.
- **📦 Sammlungs-Management**: 
  - Server-seitige Pagination ("Mehr laden").
  - A - Z Sortierung nach Künstler, Titel oder Jahr.
  - Filterung nach Formaten (Vinyl, CD, etc.).
- **⭐ Wantlist**: Behalte deine Wunschliste im Blick.
- **🎧 Spotify Integration**: 
  - **Audio-Hover**: Höre 30-sekündige Previews deiner Alben beim Drüberfahren (Work in Progress).
  - **Account-Sync**: Verbinde deinen Spotify-Account für ein nahtloses Erlebnis.
- **🛡️ Datenschutz**: Vollständige OAuth-Integration für Discogs und Spotify.

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **Lucide React** (Icons)
- **Tailwind CSS** (Styling)
- **OAuth 1.0a / 2.0** (Discogs & Spotify)

## ⚙️ Setup

1.  **Repository klonen**:
    ```bash
    git clone https://github.com/MGue95/DiscMaster.git
    cd DiscMaster
    ```

2.  **Abhängigkeiten installieren**:
    ```bash
    npm install
    ```

3.  **Umgebungsvariablen**:
    Erstelle eine `.env.local` Datei basierend auf der `.env.example`:
    ```env
    DISCOGS_CONSUMER_KEY=xxx
    DISCOGS_CONSUMER_SECRET=xxx
    SPOTIFY_CLIENT_ID=xxx
    SPOTIFY_CLIENT_SECRET=xxx
    ```

4.  **Dev-Server starten**:
    ```bash
    npm run dev
    ```

## 📝 Lizenz

Dieses Projekt ist für den privaten Gebrauch im Rahmen der Discogs API Nutzungsbedingungen erstellt.

---
*Crafted for Vinyl Lovers.*
