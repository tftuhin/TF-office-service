import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';
import { createClient } from '@/lib/supabase/client';

let checkInterval: NodeJS.Timeout | null = null;
let lastCheckedTime = new Date();

export async function initBackgroundNotifications() {
  console.log('Initializing background notifications');

  try {
    // Check if running in Capacitor
    if (typeof (window as any).capacitor === 'undefined' &&
        typeof (window as any).Capacitor === 'undefined') {
      console.log('Not in Capacitor, skipping background notifications');
      return;
    }

    // Request notification permission
    const permission = await LocalNotifications.requestPermissions();
    console.log('Background notification permission:', permission);

    // Start checking for new orders every 30 seconds
    if (checkInterval) clearInterval(checkInterval);

    checkInterval = setInterval(checkForNewOrders, 30000);

    // Also check immediately
    checkForNewOrders();

    // Listen for app resume to check notifications
    App.addListener('resume', () => {
      console.log('App resumed, checking for notifications');
      checkForNewOrders();
    });

  } catch (error) {
    console.error('Background notification init error:', error);
  }
}

async function checkForNewOrders() {
  try {
    const supabase = createClient();

    // Get new orders since last check
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, user_id, status, created_at, items!inner(menu_item(name))')
      .eq('status', 'pending')
      .gt('created_at', lastCheckedTime.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error checking orders:', error);
      return;
    }

    lastCheckedTime = new Date();

    if (orders && orders.length > 0) {
      console.log('Found new orders:', orders.length);

      // Show notification for first new order
      const order = orders[0];
      const itemCount = (order.items as any[])?.length || 0;

      await LocalNotifications.schedule({
        notifications: [
          {
            title: '🆕 New Order!',
            body: `Order #${order.id} - ${itemCount} item${itemCount > 1 ? 's' : ''}`,
            id: Math.floor(Date.now() / 1000),
            schedule: { at: new Date(Date.now() + 100) },
            smallIcon: 'ic_launcher',
            largeBody: `New order from staff member with ${itemCount} item${itemCount > 1 ? 's' : ''}`,
            summaryText: `${orders.length} new order${orders.length > 1 ? 's' : ''}`,
            sound: 'beep',
          },
        ],
      });

      console.log('Notification scheduled for new order');
    }
  } catch (error) {
    console.error('Error checking for new orders:', error);
  }
}

export function stopBackgroundNotifications() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

// Handle notification tap
export function setupNotificationActions() {
  try {
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Notification tapped:', notification);
      if (notification.actionId === 'order') {
        window.location.href = '/canteen';
      }
    });
  } catch (error) {
    console.error('Error setting up notification actions:', error);
  }
}
