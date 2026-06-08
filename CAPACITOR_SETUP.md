# Themefisher Office Service - Mobile App Setup

This project is now set up to run as a native mobile app using Capacitor, with proper background notifications.

## Prerequisites

- Node.js 16+ and npm
- iOS: Xcode 13+ (macOS only)
- Android: Android Studio + JDK 11+

## Architecture

The mobile app is a Capacitor wrapper around the Next.js web application:
- **Development mode**: Capacitor loads from `http://localhost:3000` (local Next.js dev server)
- **Production mode**: Capacitor loads from `https://tf-office-service.vercel.app` (deployed backend)

This approach allows the app to use all Next.js features (dynamic routes, SSR, etc.) while still running as a native mobile app with local notifications.

## Quick Start - iOS

### For Development:

Terminal 1: Start the Next.js dev server
```bash
npm run dev
```

Terminal 2: Add iOS platform and open Xcode
```bash
npm run mobile:ios
```

In Xcode:
1. Select the "App" target
2. Go to Signing & Capabilities
3. Set your development team
4. Click the Run button (or ⌘R)

The app will load from your local dev server at http://localhost:3000 on simulator/device.

### For Production Build:

```bash
npm run build
npx cap copy ios  # Copy web assets
npm run mobile:sync  # Sync to native projects
```

Then in Xcode:
1. Change scheme from "App" → "App Release"
2. Build and archive for App Store
3. Set your development team and signing
4. Submit to App Store Connect

## Quick Start - Android

### For Development:

Terminal 1: Start the Next.js dev server
```bash
npm run dev
```

Terminal 2: Add Android platform and open Android Studio
```bash
npm run mobile:android
```

In Android Studio:
1. Wait for gradle sync to complete
2. Click the Run button (or Shift+F10)
3. Select emulator or connected device

The app will load from your local dev server at http://localhost:3000.

### For Production Build:

```bash
npm run build
npx cap copy android  # Copy web assets
npm run mobile:sync  # Sync to native projects
```

Then in Android Studio:
1. Build → Generate Signed Bundle/APK
2. Follow the wizard to generate a signed AAB for Google Play

## Syncing Changes

After making code changes to the web app:

```bash
npm run mobile:sync  # Syncs native projects with updated code
```

For development, just rebuild and refresh the app. For production, rebuild and redeploy through the native IDEs.

## Features

✅ **Background Notifications** - Notifications work even when app is closed
✅ **Native UI** - App runs as full native application
✅ **Dynamic Routes** - Full Next.js support (SSR, API routes, etc.)
✅ **Offline Support** - Works with service workers
✅ **Loud Alerts** - System-level notifications with sound and vibration
✅ **Custom Branding** - Themefisher branding on splash screens

## Testing Notifications

### On iOS/Android Device:

1. Open the app as staff/admin user
2. Grant notification permissions when prompted
3. From another browser/device, place an order
4. Your device will receive a notification even if the app is minimized

## App Store Deployment

### iOS App Store
- Increment version in `capacitor.config.ts`
- Run `npx cap copy ios`
- In Xcode: set development team, build archive, submit to App Store Connect

### Google Play Store
- Increment version in `android/app/build.gradle`
- Run `npx cap copy android`
- In Android Studio: generate signed AAB, submit to Google Play Console

## Troubleshooting

**App won't connect to localhost in simulator:**
- On iOS: simulators can access host machine via `http://localhost:3000` by default
- On Android: use `http://10.0.2.2:3000` instead of localhost for emulator

**Notifications not working:**
- Check that notifications are granted in device settings
- Verify the app is built with latest changes (`npm run mobile:sync`)
- Check console logs in Xcode/Android Studio

**Build errors:**
- Clear Gradle cache: `cd android && ./gradlew clean`
- Update Capacitor: `npm install @capacitor/cli@latest`

## Configuration

### capacitor.config.ts

The config automatically switches between:
- **Development**: Loads from `http://localhost:3000`
- **Production**: Loads from `https://tf-office-service.vercel.app`

To test production mode locally:
```bash
npm run build  # Build Next.js
npx cap copy ios
npm run mobile:sync
# In Xcode, set environment variable NODE_ENV=production before running
```

## Local Notifications

The app uses Capacitor's LocalNotifications API. See `lib/capacitor-notifications.ts` for implementation.

Notifications trigger automatically when orders are placed with:
- Custom title and message
- System sound and vibration
- Tap action opens the Canteen page
