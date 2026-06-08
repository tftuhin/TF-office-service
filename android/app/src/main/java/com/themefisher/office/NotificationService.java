package com.themefisher.office;

import android.app.Service;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;
import androidx.core.app.NotificationCompat;

public class NotificationService extends Service {
    private static final String TAG = "NotificationService";
    private Handler handler = new Handler(Looper.getMainLooper());
    private Runnable checkRunnable;

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "NotificationService created");
        setupPeriodicCheck();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "NotificationService started");

        // Show foreground notification to keep service alive
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, "orders")
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .setContentTitle("Themefisher Office Service")
                .setContentText("Checking for new orders...")
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setOngoing(true);

        startForeground(1, builder.build());
        return START_STICKY;
    }

    private void setupPeriodicCheck() {
        checkRunnable = new Runnable() {
            @Override
            public void run() {
                Log.d(TAG, "Checking for new orders");
                // Check for orders here
                handler.postDelayed(this, 30000); // Check every 30 seconds
            }
        };
        handler.post(checkRunnable);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "NotificationService destroyed");
        if (handler != null && checkRunnable != null) {
            handler.removeCallbacks(checkRunnable);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
