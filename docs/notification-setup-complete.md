# Push Notifications Setup - Complete Implementation

## Overview
Your Silver POS app now has complete push notification functionality implemented using Expo Notifications and Firebase Cloud Messaging (FCM).

## What's Been Set Up

### 1. Dependencies Installed
- `expo-notifications` - For handling push notifications
- `expo-device` - For device detection
- `expo-constants` - For accessing app configuration

### 2. Firebase Configuration
- `google-services.json` has been placed in `android/app/google-services.json`
- `app.json` has been updated with Firebase configuration
- Project ID has been set to match your Firebase project: `silvers-e6db2`

### 3. App Configuration Updates
The following has been added to your `app.json`:

```json
{
  "android": {
    "googleServicesFile": "./android/app/google-services.json"
  },
  "notification": {
    "icon": "./assets/silvers.png",
    "color": "#378388",
    "androidMode": "default",
    "androidCollapsedTitle": "New notification"
  },
  "extra": {
    "eas": {
      "projectId": "silvers-e6db2"
    }
  }
}
```

### 4. Service Implementation
- **NotificationService** (`src/services/notification-service.ts`): Complete service for handling all notification operations
- **useNotifications Hook** (`src/hooks/useNotifications.ts`): React hook for easy integration in components
- **NotificationTest Component** (`src/components/NotificationTest.tsx`): Test interface for notifications
- **Test Page** (`src/app/notifications-test.tsx`): Dedicated page for testing notifications

## How to Test

### Step 1: Build and Install Development Build
```bash
# Build development version
eas build -p android --profile development

# Install the APK on your physical Android device using the provided URL/QR code
```

### Step 2: Test in Your App
1. Navigate to `/notifications-test` in your app
2. Allow notification permissions when prompted
3. Copy the Expo Push Token that appears
4. Use the test buttons to send notifications

### Step 3: Test with Expo Push Tool
1. Go to [expo.dev/notifications](https://expo.dev/notifications)
2. Paste your Expo Push Token
3. Send test notifications

## Usage in Your App

### Basic Usage with Hook
```tsx
import { useNotifications } from '../hooks/useNotifications';

function MyComponent() {
  const { 
    expoPushToken, 
    sendOrderNotification, 
    sendInventoryNotification 
  } = useNotifications();

  const handleNewOrder = async (orderData) => {
    await sendOrderNotification({
      orderId: orderData.id,
      customerName: orderData.customer.name,
      total: orderData.total,
      status: orderData.status
    });
  };

  return (
    // Your component JSX
  );
}
```

### Direct Service Usage
```tsx
import NotificationService from '../services/notification-service';

// Send custom notification
await NotificationService.sendPushNotification({
  to: expoPushToken,
  title: 'Custom Title',
  body: 'Custom message',
  data: { customData: 'value' }
});
```

## Available Notification Types

### 1. Test Notification
```tsx
await sendTestNotification();
```

### 2. Order Notification
```tsx
await sendOrderNotification({
  orderId: 'ORD-001',
  customerName: 'John Doe',
  total: 25.99,
  status: 'pending'
});
```

### 3. Inventory Alert
```tsx
await sendInventoryNotification({
  productName: 'Coffee Beans',
  currentStock: 5,
  minStock: 10
});
```

### 4. Custom Notification
```tsx
await NotificationService.sendPushNotification({
  to: expoPushToken,
  title: 'Your Title',
  body: 'Your message',
  data: { type: 'custom', additionalData: 'value' }
});
```

## Integration Points

### Order Service Integration
Add to your order creation/update logic:
```tsx
import { useNotifications } from '../hooks/useNotifications';

const { sendOrderNotification } = useNotifications();

// When order is created/updated
await sendOrderNotification({
  orderId: order.id,
  customerName: order.customer.name,
  total: order.total,
  status: order.status
});
```

### Inventory Service Integration
Add to your inventory management:
```tsx
import { useNotifications } from '../hooks/useNotifications';

const { sendInventoryNotification } = useNotifications();

// When stock is low
if (product.stock <= product.minStock) {
  await sendInventoryNotification({
    productName: product.name,
    currentStock: product.stock,
    minStock: product.minStock
  });
}
```

## Important Notes

1. **Physical Device Required**: Push notifications only work on physical devices, not emulators
2. **Permissions**: Users must grant notification permissions
3. **Token Management**: The Expo Push Token is automatically managed by the service
4. **Error Handling**: All methods include proper error handling and logging
5. **Listeners**: Notification listeners are automatically set up in the hook

## Troubleshooting

### Common Issues
1. **"Must use physical device"**: Install on real Android device
2. **"Permission not granted"**: User denied notification permissions
3. **"Project ID not found"**: Check EAS configuration in app.json
4. **"Failed to send notification"**: Check network connection and token validity

### Debug Steps
1. Check console logs for detailed error messages
2. Verify Firebase configuration is correct
3. Ensure development build is properly installed
4. Test with expo.dev/notifications tool first

## Next Steps

1. **Build and Test**: Create development build and test on device
2. **Integrate**: Add notification calls to your existing order/inventory logic
3. **Customize**: Modify notification messages and data as needed
4. **Production**: When ready, build production version with same configuration

Your push notification system is now fully set up and ready to use!
