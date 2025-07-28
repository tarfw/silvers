


# Expo Push Notifications Setup (Android Only, with Firebase)

This guide follows the latest Expo documentation for setting up push notifications on **Android only** using Firebase Cloud Messaging (FCM) and sending via [expo.dev/notifications](https://expo.dev/notifications).

## Installing the Development Build via URL Scan

To test push notifications, you need to install the development build of your Expo app on your Android device. The recommended way is to build your app with EAS Build and install it by scanning the QR code or using the install URL provided by Expo:

1. Run `eas build -p android --profile development` to create a development build.
2. After the build completes, Expo will provide a URL and QR code. Open the URL on your Android device or scan the QR code to download and install the APK.
3. Open the installed app on your device. This is required for push notifications to work (they do not work on emulators or simulators).

For more details, see: [Expo Development Builds](https://docs.expo.dev/development/build/)

## 1. Prerequisites
- Expo SDK 48 or later (recommended)
- Firebase project ([console](https://console.firebase.google.com/))
- Expo account


## 2. Install Dependencies
In your project root, run:

```sh
npx expo install expo-notifications expo-device expo-constants
```
* `expo-notifications` is used to request permission and obtain the ExpoPushToken.
* `expo-device` is used to check for a physical device.
* `expo-constants` is used to get the `projectId` from the app config.

## 3. Configure Firebase for Android
1. In the [Firebase Console](https://console.firebase.google.com/), create a project (or use an existing one).
2. Add an Android app to your Firebase project. Use your app's package name (e.g., `com.yourcompany.yourapp`).
3. Download the `google-services.json` file from Firebase and place it in your project at `android/app/google-services.json`.
4. In your `app.json` or `app.config.js`, add:
   ```json
   {
     "android": {
       "googleServicesFile": "./android/app/google-services.json"
     }
   }
   ```
5. In the Firebase Console, go to **Project Settings > Cloud Messaging** and note your **Sender ID** (used by Expo to send notifications).

## 4. Configure Expo Notifications
In your `app.json` or `app.config.js`, add a notification config (optional but recommended):

```json
{
  "expo": {
    "notification": {
      "icon": "./assets/icon.png",
      "color": "#ffffff",
      "androidMode": "default",
      "androidCollapsedTitle": "New notification"
    }
  }
}
```

## 5. Build Your App
Build your app for Android using EAS Build or classic build:

```sh
eas build -p android
```
or
```sh
expo build:android
```


## 6. Minimal Working Example (Register, Send, and Receive Notifications)

Below is a minimal working example for registering, sending, and receiving push notifications, as recommended by the latest Expo docs. This example uses the correct `projectId` logic for EAS builds and development builds:

```tsx
import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError('Permission not granted to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch((error: any) => setExpoPushToken(`${error}`));

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
      <Text>Your Expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
      </View>
      <Button
        title="Press to Send Notification"
        onPress={async () => {
          await sendPushNotification(expoPushToken);
        }}
      />
    </View>
  );
}
```

**Note:**
- You must use a real device (not an emulator) for push notifications.
- The `projectId` is required for development builds and is set automatically by EAS, but you should fetch it as shown above.


## 7. Build and Test

1. Build your app for Android using EAS Build:
   ```sh
   eas build -p android --profile development
   ```
2. Install the APK on your device using the Expo-provided URL or QR code.
3. Start your development server:
   ```sh
   npx expo start
   ```
4. Open the installed app on your device. The ExpoPushToken will be displayed in the app UI.
5. Use the [Expo Push Notification Tool](https://expo.dev/notifications) to send a test notification to your device using the ExpoPushToken.


## 8. References
- [Expo Push Notifications Setup (Official)](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Expo Push Notification Tool](https://expo.dev/notifications)
- [Firebase Console](https://console.firebase.google.com/)
- [Expo Development Builds](https://docs.expo.dev/development/build/)
