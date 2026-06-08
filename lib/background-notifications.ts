import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';
import { createClient } from '@/lib/supabase/client';

let checkInterval: NodeJS.Timeout | null = null;
let notifiedOrderIds = new Set<number>();

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

    // Get initial list of pending orders
    await loadInitialOrders();

    // Start checking for new orders every 10 seconds
    if (checkInterval) clearInterval(checkInterval);
    checkInterval = setInterval(checkForNewOrders, 10000);

    // Also check immediately after a short delay
    setTimeout(checkForNewOrders, 2000);

    // Listen for app resume to check notifications
    App.addListener('resume', () => {
      console.log('App resumed, checking for notifications');
      checkForNewOrders();
    });

    // Keep the service alive
    App.addListener('pause', () => {
      console.log('App paused, background notifications will continue');
    });

  } catch (error) {
    console.error('Background notification init error:', error);
  }
}

async function loadInitialOrders() {
  try {
    const supabase = createClient();

    // Get all current pending orders to avoid notifying about old ones
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'pending');

    if (!error && orders) {
      orders.forEach(order => {
        notifiedOrderIds.add(order.id);
      });
      console.log('Loaded initial orders:', notifiedOrderIds.size);
    }
  } catch (error) {
    console.error('Error loading initial orders:', error);
  }
}

async function checkForNewOrders() {
  try {
    const supabase = createClient();

    // Get all pending orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, user_id, status, created_at, items!inner(menu_item(name))')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error checking orders:', error);
      return;
    }

    if (!orders || orders.length === 0) {
      console.log('No pending orders');
      return;
    }

    // Find new orders that we haven't notified about
    const newOrders = orders.filter(order => !notifiedOrderIds.has(order.id));

    if (newOrders.length > 0) {
      console.log('Found new orders:', newOrders.length);

      // Show notification for each new order
      for (const order of newOrders) {
        const itemCount = (order.items as any[])?.length || 0;

        notifiedOrderIds.add(order.id);

        await LocalNotifications.schedule({
          notifications: [
            {
              title: '🆕 New Order!',
              body: `Order #${order.id} - ${itemCount} item${itemCount > 1 ? 's' : ''}`,
              id: order.id,
              schedule: { at: new Date(Date.now() + 100) },
              smallIcon: 'ic_launcher',
              largeBody: `New order with ${itemCount} item${itemCount > 1 ? 's' : ''}`,
              summaryText: `New pending order`,
              sound: 'beep',
            },
          ],
        });

        console.log('Notification scheduled for order:', order.id);
      }
    } else {
      console.log('No new orders to notify about');
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
