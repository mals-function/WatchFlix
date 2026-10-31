# 🎬 WatchFlix — Netflix-Inspired Cross-Platform Streaming App

WatchFlix is a production-grade, Netflix-inspired mobile and web application built with **Ionic Vue 3**, **Capacitor**, and **Supabase**. It provides real-time catalog discovery, streaming platform availability (Netflix, Disney+, Prime Video, Max, Apple TV+), TV episode listings, video playback with HLS (.m3u8) / MP4 support, watch progress tracking, and custom stream management for personal usage.

---

## 🌟 Key Features

- **Cinematic Netflix UI**: Immersive dark theme (`#141414`), responsive hero banner, horizontal carousel rows, top 10 rankings, and fluid bottom navigation.
- **Multi-API Catalog**:
  - **TMDB API**: Trending, Top Rated, Netflix Originals, genres, ratings, and JustWatch streaming availability.
  - **Watchmode API**: Deep streaming platform availability with provider badges.
  - **TVmaze API**: Full TV series episode breakdown, runtimes, descriptions, and thumbnails (100% free, no key required).
- **HLS & Native Video Player**:
  - Built-in **HLS.js** engine supporting adaptive `.m3u8` video streams.
  - Full playback controls: 10s scrub forward/backward, speed multiplier (0.5x - 2x), volume, fullscreen, and quality level selector.
  - Preloaded with authorized test streams (Big Buck Bunny, Tears of Steel, Sintel).
  - YouTube trailer fallback when direct video source is not attached.
- **Supabase Cloud Backend**:
  - Email/Password authentication and persistent user profiles.
  - User Watchlist / Favorites synchronization.
  - Watch History with resume position tracking (Continue Watching).
  - Row Level Security (RLS) policies.
  - **Offline/Guest Fallback**: Works immediately out-of-the-box without requiring initial Supabase credentials.
- **Admin Stream Source Manager**:
  - Dynamically attach authorized HLS, MP4, or embed stream URLs to any movie or TV episode directly in the app.
- **Cross-Platform Native Android**:
  - Powered by Capacitor with native Android project structure.
  - Automated CI/CD GitHub Actions workflow to build downloadable `.apk` artifacts.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Ionic Vue 3, Vite, Tailwind CSS | Mobile UI & responsive layout |
| **Mobile Runtime** | Capacitor 8 | Native Android & iOS wrapper |
| **Catalog API** | TMDB API (v3) | Movies, series, posters & ratings |
| **Providers API** | Watchmode API & TMDB JustWatch | Streaming service availability |
| **Series & Episodes** | TVmaze API | Season & episode metadata (free) |
| **Backend / DB** | Supabase & PostgreSQL | Auth, Watchlist, Watch History, Custom Streams |
| **Video Engine** | HLS.js & HTML5 Video | Adaptive HTTP Live Streaming |
| **CI / CD** | GitHub Actions | Automated Android APK compilation |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ or v20+)
- npm or pnpm
- Git

### 2. Installation
```bash
git clone <your-repo-url>
cd WatchFlix
npm install
```

### 3. Run Web Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🗄️ Supabase Database Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/schema.sql` from this repository, paste the contents into the editor, and run it.
4. In your WatchFlix app:
   - Tap **Settings** (gear icon) or **Profile** tab.
   - Enter your **Supabase URL** and **Anon Public Key**.
   - Your watchlists and history will now automatically sync to the cloud!

---

## 📱 Android Build & Capacitor Workflow

### 1. Build Web Assets & Sync with Android
```bash
npm run build
npx cap sync android
```

### 2. Open in Android Studio
```bash
npx cap open android
```
From Android Studio, click **Run** to launch on an emulator or connected physical Android device.

### 3. Build APK from Command Line
```bash
cd android
./gradlew assembleDebug
```
The compiled APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🤖 Automated APK Building via GitHub Actions

This repository includes a ready-to-use GitHub Actions workflow located at `.github/workflows/build-apk.yml`.

### How to use:
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial WatchFlix release"
   git branch -M main
   git remote add origin https://github.com/<your-username>/WatchFlix.git
   git push -u origin main
   ```
2. Navigate to your GitHub repository and click the **Actions** tab.
3. The **Build WatchFlix Android APK** workflow will run automatically on push.
4. Once completed, download the `WatchFlix-debug-apk` from the **Artifacts** section and install it directly on your Android phone!

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file in the project root (or copy from `.env.example`):

```ini
# TMDB API Key (Free from https://www.themoviedb.org/settings/api)
VITE_TMDB_API_KEY=45db073573c0f4f6e4d4ff46b41cb765

# Watchmode API Key (Optional, from https://api.watchmode.com)
VITE_WATCHMODE_API_KEY=

# Supabase Credentials (Optional for cloud sync)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

*Note: All keys can also be configured interactively inside the running app via the in-app Settings modal.*

---

## 📄 License
MIT License. Created for personal, educational, and authorized media streaming usage.
