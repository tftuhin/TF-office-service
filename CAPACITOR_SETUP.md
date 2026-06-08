# Themefisher Office Service - Mobile App Setup

This project is now set up to run as a native mobile app using Capacitor, with proper background notifications.

## Prerequisites

- Node.js 16+ and npm
- iOS: Xcode 13+ (macOS only)
- Android: Android Studio + JDK 11+

## Building the Web App

```bash
npm run build
npm run export
```

This creates the `/out` directory that Capacitor will use.

## Adding Platforms

### iOS

```bash
npx cap add ios
npx cap open ios
```

Then in Xcode:
1. Select the Themefisher target
2. Go to Signing & Capabilities
3. Add "Push Notifications" capability
4. Set your development team
5. Build and run on device

### Android

```bash
npx cap add android
npx cap open android
```

Then in Android Studio:
1. Wait for gradle sync
2. Build → Make Project
3. Run on emulator or device

## Syncing Changes

After making code changes:

```bash
npm run build
npm run export
npx cap sync  # Updates native projects with new web code
```

## Features

✅ **Background Notifications** - Notifications work even when app is closed
✅ **Native UI** - App runs as full native application
✅ **Offline Support** - Works with service workers
✅ **Loud Alerts** - System-level notifications with sound and vibration
✅ **Custom Branding** - Themefisher branding on splash screens

## Testing Notifications

1. Open the app as staff/admin
2. Enable notifications when prompted
3. Place an order from another device
4. Staff device will receive notification even if app is minimized

## App Store Deployment

### iOS App Store
- Update version in `capacitor.config.ts`
- Build archive in Xcode
- Submit to App Store Connect

### Google Play Store
- Update version in `android/app/build.gradle`
- Build signed APK/AAB in Android Studio
- Submit to Google Play Console

## Troubleshooting

**Notifications not working:**
- Check notification permissions in device settings
- Verify the app is built with latest changes (`npx cap sync`)
- Check console logs in native IDE

**Build errors:**
- Clear gradle cache: `cd android && ./gradlew clean`
- Update Capacitor: `npm install @capacitor/cli@latest`

## Local Notifications API

The app uses Capacitor's LocalNotifications API. See `lib/capacitor-notifications.ts` for the implementation.

Notifications are automatically triggered when orders are placed, with:
- Custom title and message
- System sound and vibration
- Tap action to open Canteen page
