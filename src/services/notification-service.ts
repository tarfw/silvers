import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationMessage {
  to: string;
  sound?: 'default' | null;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Register for push notifications and get the Expo push token
   */
  public async registerForPushNotifications(): Promise<string | null> {
    try {
      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#378388',
        });
      }

      // Check if running on physical device
      if (!Device.isDevice) {
        throw new Error('Must use physical device for push notifications');
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted to get push token for push notification!');
      }

      // Get project ID
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      
      if (!projectId) {
        throw new Error('Project ID not found');
      }

      // Get the push token
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      this.expoPushToken = pushTokenString;
      console.log('Expo Push Token:', pushTokenString);
      
      return pushTokenString;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      throw error;
    }
  }

  /**
   * Get the current Expo push token
   */
  public getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Send a push notification using Expo's push service
   */
  public async sendPushNotification(message: PushNotificationMessage): Promise<void> {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: message.to,
          sound: message.sound || 'default',
          title: message.title,
          body: message.body,
          data: message.data || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send notification: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Notification sent successfully:', result);
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  /**
   * Send a test notification to the current device
   */
  public async sendTestNotification(): Promise<void> {
    if (!this.expoPushToken) {
      throw new Error('No push token available. Please register for notifications first.');
    }

    await this.sendPushNotification({
      to: this.expoPushToken,
      title: 'Test Notification',
      body: 'This is a test notification from Silver POS!',
      data: { 
        type: 'test',
        timestamp: new Date().toISOString()
      },
    });
  }

  /**
   * Add notification received listener
   */
  public addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add notification response received listener (when user taps notification)
   */
  public addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Remove notification listeners
   */
  public removeNotificationListeners(subscriptions: Notifications.Subscription[]): void {
    subscriptions.forEach(subscription => subscription.remove());
  }

  /**
   * Send order notification
   */
  public async sendOrderNotification(orderData: {
    orderId: string;
    customerName: string;
    total: number;
    status: string;
  }): Promise<void> {
    if (!this.expoPushToken) {
      throw new Error('No push token available. Please register for notifications first.');
    }

    await this.sendPushNotification({
      to: this.expoPushToken,
      title: 'New Order',
      body: `Order #${orderData.orderId} for ${orderData.customerName} - $${orderData.total.toFixed(2)}`,
      data: {
        type: 'order',
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        total: orderData.total,
        status: orderData.status,
      },
    });
  }

  /**
   * Send inventory notification
   */
  public async sendInventoryNotification(productData: {
    productName: string;
    currentStock: number;
    minStock: number;
  }): Promise<void> {
    if (!this.expoPushToken) {
      throw new Error('No push token available. Please register for notifications first.');
    }

    await this.sendPushNotification({
      to: this.expoPushToken,
      title: 'Low Stock Alert',
      body: `${productData.productName} is running low (${productData.currentStock} left)`,
      data: {
        type: 'inventory',
        productName: productData.productName,
        currentStock: productData.currentStock,
        minStock: productData.minStock,
      },
    });
  }
}

export default NotificationService.getInstance();
