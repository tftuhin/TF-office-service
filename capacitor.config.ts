import type { CapacitorConfig } from '@capacitor/cli';

const isProduction = process.env.NODE_ENV === 'production';

const config: CapacitorConfig = {
  appId: 'com.themefisher.office',
  appName: 'Themefisher Office Service',
  webDir: 'public',
  // Development: Load from local server (run: npm run dev)
  // Production: Load from deployed Vercel URL
  server: {
    url: isProduction
      ? 'https://tf-office-service.vercel.app'
      : 'http://localhost:3000',
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#1a2b45',
      sound: 'beep.wav',
    }
  }
};

export default config;
