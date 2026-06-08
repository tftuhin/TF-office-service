package com.themefisher.office;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;

public class NotificationChannelHelper {
    public static void createNotificationChannels(Application application) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager =
                    (NotificationManager) application.getSystemService(Application.NOTIFICATION_SERVICE);

            // Create notification channel for orders
            NotificationChannel ordersChannel = new NotificationChannel(
                    "orders",
                    "Order Notifications",
                    NotificationManager.IMPORTANCE_MAX
            );
            ordersChannel.setDescription("Notifications for new orders");
            ordersChannel.enableLights(true);
            ordersChannel.enableVibration(true);
            ordersChannel.setSound(android.provider.Settings.System.DEFAULT_NOTIFICATION_URI,
                    new android.media.AudioAttributes.Builder()
                            .setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION)
                            .build());

            notificationManager.createNotificationChannel(ordersChannel);
        }
    }
}
