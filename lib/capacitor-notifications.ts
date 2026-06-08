import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';

export async function initializeCapacitorNotifications() {
  try {
    // Check if running in Capacitor
    if (!('capacitor' in window)) {
      console.log('Not running in Capacitor');
      return false;
    }

    // Request notification permission
    const permission = await LocalNotifications.requestPermissions();
    console.log('Notification permission:', permission);

    return true;
  } catch (error) {
    console.error('Capacitor notification init error:', error);
    return false;
  }
}

export async function showCapacitorNotification(
  title: string,
  body: string,
  options?: {
    largeBody?: string;
    summaryText?: string;
    vibrate?: boolean;
    sound?: string;
  }
) {
  try {
    if (!('capacitor' in window)) {
      console.log('Not in Capacitor, skipping notification');
      return;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: Math.floor(Date.now() / 1000),
          schedule: { at: new Date(Date.now() + 100) },
          smallIcon: 'ic_stat_icon_config_sample',
          largeBody: options?.largeBody,
          summaryText: options?.summaryText,
          sound: options?.sound || 'beep',
        },
      ],
    });

    console.log('Capacitor notification scheduled:', title);
  } catch (error) {
    console.error('Capacitor notification error:', error);
  }
}

export async function setupAppLifecycle() {
  try {
    // Handle app pause/resume for notifications
    App.addListener('pause', () => {
      console.log('App paused');
    });

    App.addListener('resume', () => {
      console.log('App resumed');
    });

    // Handle notification tap
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Notification action performed:', notification);
      // Navigate to orders/canteen page
      window.location.href = '/canteen';
    });
  } catch (error) {
    console.error('App lifecycle setup error:', error);
  }
}
