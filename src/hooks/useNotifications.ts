import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import NotificationService from '../services/notification-service';

export interface NotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  isRegistering: boolean;
  error: string | null;
}

export interface UseNotificationsReturn extends NotificationState {
  registerForNotifications: () => Promise<void>;
  sendOrderNotification: (orderData: {
    orderId: string;
    customerName: string;
    total: number;
    status: string;
  }) => Promise<void>;
  sendInventoryNotification: (productData: {
    productName: string;
    currentStock: number;
    minStock: number;
  }) => Promise<void>;
  clearError: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [state, setState] = useState<NotificationState>({
    expoPushToken: null,
    notification: null,
    isRegistering: false,
    error: null,
  });

  const updateState = useCallback((updates: Partial<NotificationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const registerForNotifications = useCallback(async () => {
    try {
      updateState({ isRegistering: true, error: null });
      
      const token = await NotificationService.registerForPushNotifications();
      
      updateState({ 
        expoPushToken: token,
        isRegistering: false 
      });
    } catch (error) {
      console.error('Failed to register for notifications:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Failed to register for notifications',
        isRegistering: false 
      });
    }
  }, [updateState]);



  const sendOrderNotification = useCallback(async (orderData: {
    orderId: string;
    customerName: string;
    total: number;
    status: string;
  }) => {
    try {
      updateState({ error: null });
      await NotificationService.sendOrderNotification(orderData);
    } catch (error) {
      console.error('Failed to send order notification:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Failed to send order notification'
      });
    }
  }, [updateState]);

  const sendInventoryNotification = useCallback(async (productData: {
    productName: string;
    currentStock: number;
    minStock: number;
  }) => {
    try {
      updateState({ error: null });
      await NotificationService.sendInventoryNotification(productData);
    } catch (error) {
      console.error('Failed to send inventory notification:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Failed to send inventory notification'
      });
    }
  }, [updateState]);

  useEffect(() => {
    // Set up notification listeners
    const notificationListener = NotificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        updateState({ notification });
      }
    );

    const responseListener = NotificationService.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        // Handle notification tap here
        // You can navigate to specific screens based on notification data
      }
    );

    // Auto-register for notifications on mount
    registerForNotifications();

    // Cleanup listeners on unmount
    return () => {
      NotificationService.removeNotificationListeners([
        notificationListener,
        responseListener,
      ]);
    };
  }, [registerForNotifications, updateState]);

  return {
    ...state,
    registerForNotifications,
    sendOrderNotification,
    sendInventoryNotification,
    clearError,
  };
};
