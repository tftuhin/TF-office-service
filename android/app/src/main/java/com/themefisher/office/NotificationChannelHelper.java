package com.themefisher.office;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

public class NotificationChannelHelper {
    public static void createNotificationChannels(Application application) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager =
                    (NotificationManager) application.getSystemService(Application.NOTIFICATION_SERVICE);

            // Create notification channel for orders with MAXIMUM volume
            NotificationChannel ordersChannel = new NotificationChannel(
                    "orders",
                    "Order Notifications",
                    NotificationManager.IMPORTANCE_MAX
            );
            ordersChannel.setDescription("Loud notifications for new orders");

            // Enable lights (bright red)
            ordersChannel.enableLights(true);
            ordersChannel.setLightColor(0xFFFF0000); // Red light

            // Enable vibration with strong pattern
            ordersChannel.enableVibration(true);
            // Vibration: 500ms on, 200ms off, 500ms on, 200ms off, 500ms on
            ordersChannel.setVibrationPattern(new long[]{0, 500, 200, 500, 200, 500});

            // Use ALARM sound (loudest notification sound)
            Uri alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (alarmSound == null) {
                // Fallback to notification sound
                alarmSound = Settings.System.DEFAULT_NOTIFICATION_URI;
            }

            AudioAttributes audioAttributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM) // Use ALARM usage for maximum volume
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build();

            ordersChannel.setSound(alarmSound, audioAttributes);

            // Set importance to max
            ordersChannel.setImportance(NotificationManager.IMPORTANCE_MAX);

            // Bypass Do Not Disturb (if possible)
            ordersChannel.setBypassDnd(true);

            notificationManager.createNotificationChannel(ordersChannel);
        }
    }
}
