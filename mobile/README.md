# SENTINEL AI - Mobile App (Expo)

This is the React Native/Expo mobile application for SENTINEL AI, a predictive women's safety system.

## Features

- 🎯 Real-time threat prediction based on multiple factors
- 🗺️ Silent navigation override for safe route suggestions
- 👥 Guardian network integration for immediate help
- ⚡ Infrastructure activation (street lights, police dispatch, safe havens)
- 🔮 45-minute threat forecasting with AI predictions
- 📍 Continuous geolocation tracking with location permissions
- 🌙 Dark theme optimized for emergency situations

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start backend API
```bash
cd ../backend
python api/app.py
# Should run on http://localhost:5000
```

### 3. Run the mobile app

**Web (fastest for development):**
```bash
npm run web
```

**iOS Simulator:**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

**Physical Device:**
```bash
npm start
# Scan QR code with Expo Go app
```


## Project Structure

```
mobile/
├── app/
│   ├── (tabs)/          # Tab-based navigation
│   │   └── index.tsx    # Dashboard home screen
│   ├── dashboard.tsx    # Main SENTINEL dashboard
│   └── _layout.tsx      # Root navigation layout
├── store/
│   └── sentinelStore.ts # Zustand global state
├── hooks/
│   └── useLocation.ts   # Geolocation tracking
├── services/
│   └── api.ts          # Backend API client
└── app.json            # Expo configuration
```

## State Management

Uses **Zustand** for global state:
- Risk data and city statistics
- User location (lat/lng)
- Threat level (safe/moderate/high)
- UI toggles and nearby guardians
- Loading and error states

## Location Tracking

**Permissions configured** in `app.json`:
- iOS: NSLocationWhenInUseUsageDescription, NSLocationAlwaysAndWhenInUseUsageDescription
- Android: ACCESS_FINE_LOCATION, ACCESS_BACKGROUND_LOCATION, FOREGROUND_SERVICE

Uses `expo-location` for continuous tracking with 10-second updates.

## API Integration

The app connects to the Flask backend at `http://localhost:5000`:

```typescript
// For physical devices, update in services/api.ts:
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000/api';
```

Endpoints:
- `/api/risk/point` - Risk at location
- `/api/risk/stats` - City statistics
- `/api/threat/forecast` - 45-minute forecast
- `/api/guardians/nearby` - Nearby guardians
- `/api/infrastructure/*` - Street lights, police, safe havens

## Development

Hot reload works automatically on file changes. Edit files in the `app/` directory.

## Building for Production

```bash
eas build --platform ios      # Build for iOS
eas build --platform android  # Build for Android
```

Requires EAS (Expo Application Services) account at https://expo.dev

## Troubleshooting

**Location permission denied?** Check device settings: Settings → App → Permissions → Location

**Backend not connecting?** Ensure Flask app running at localhost:5000 and firewall allows port 5000

**Blank screen?** Clear cache: `npm start -- --clear`

---

Built with ❤️ for women's safety | [SENTINEL AI](../README.md)
