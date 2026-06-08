import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.themefisher.office',
  appName: 'Themefisher Office Service',
  webDir: 'public',
  // Load from deployed production URL
  server: {
    url: 'https://tf-office-service.vercel.app',
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_launcher',
      iconColor: '#1a2b45',
      sound: 'beep',
      importance: 5, // Max importance
      vibrate: true,
    }
  }
};

export default config;
