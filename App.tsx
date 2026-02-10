import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import Navigation from './src/navigation';
import { MonitoringService } from './src/services/MonitoringService';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  useEffect(() => {
    // Initialize monitoring service
    MonitoringService.initialize().catch((error) => {
      console.error('Failed to initialize monitoring:', error);
    });
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Navigation />
    </>
  );
}
