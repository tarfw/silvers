import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationTestProps {
  onClose?: () => void;
}

export const NotificationTest: React.FC<NotificationTestProps> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const {
    expoPushToken,
    notification,
    isRegistering,
    error,
    registerForNotifications,
    sendTestNotification,
    sendOrderNotification,
    sendInventoryNotification,
    clearError,
  } = useNotifications();

  const handleSendTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const handleSendOrderNotification = async () => {
    try {
      await sendOrderNotification({
        orderId: 'ORD-001',
        customerName: 'John Doe',
        total: 25.99,
        status: 'pending',
      });
      Alert.alert('Success', 'Order notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send order notification');
    }
  };

  const handleSendInventoryNotification = async () => {
    try {
      await sendInventoryNotification({
        productName: 'Coffee Beans',
        currentStock: 5,
        minStock: 10,
      });
      Alert.alert('Success', 'Inventory notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send inventory notification');
    }
  };

  const copyTokenToClipboard = () => {
    if (expoPushToken) {
      // You can implement clipboard functionality here if needed
      Alert.alert(
        'Expo Push Token',
        expoPushToken,
        [
          { text: 'OK' },
          {
            text: 'Copy',
            onPress: () => {
              // Implement clipboard copy here
              console.log('Token copied:', expoPushToken);
            },
          },
        ]
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 py-4 bg-white flex-row items-center">
        <TouchableOpacity
          onPress={onClose}
          className="w-10 h-10 items-center justify-center mr-3"
        >
          <Feather name="arrow-left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-2xl font-light text-gray-900">Push Notifications</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            Push Notification Test
          </Text>

        {/* Registration Status */}
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-600 mb-2">
            Registration Status:
          </Text>
          {isRegistering ? (
            <Text className="text-blue-600">Registering for notifications...</Text>
          ) : expoPushToken ? (
            <Text className="text-green-600">✓ Registered successfully</Text>
          ) : (
            <Text className="text-red-600">✗ Not registered</Text>
          )}
        </View>

        {/* Error Display */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <Text className="text-red-800 text-sm">{error}</Text>
            <TouchableOpacity
              onPress={clearError}
              className="mt-2 bg-red-100 px-3 py-1 rounded"
            >
              <Text className="text-red-800 text-xs">Clear Error</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Push Token */}
        {expoPushToken && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-600 mb-2">
              Expo Push Token:
            </Text>
            <TouchableOpacity
              onPress={copyTokenToClipboard}
              className="bg-gray-100 p-3 rounded-lg"
            >
              <Text className="text-xs text-gray-800 font-mono">
                {expoPushToken}
              </Text>
              <Text className="text-xs text-blue-600 mt-1">Tap to view/copy</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Last Notification */}
        {notification && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-600 mb-2">
              Last Notification:
            </Text>
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Text className="font-medium text-blue-900">
                {notification.request.content.title}
              </Text>
              <Text className="text-blue-800 text-sm mt-1">
                {notification.request.content.body}
              </Text>
              {notification.request.content.data && (
                <Text className="text-blue-700 text-xs mt-2 font-mono">
                  Data: {JSON.stringify(notification.request.content.data)}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="space-y-3">
          <TouchableOpacity
            onPress={registerForNotifications}
            disabled={isRegistering}
            className={`p-3 rounded-lg ${
              isRegistering ? 'bg-gray-300' : 'bg-blue-500'
            }`}
          >
            <Text className="text-white text-center font-medium">
              {isRegistering ? 'Registering...' : 'Re-register for Notifications'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSendTestNotification}
            disabled={!expoPushToken}
            className={`p-3 rounded-lg ${
              expoPushToken ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <Text className="text-white text-center font-medium">
              Send Test Notification
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSendOrderNotification}
            disabled={!expoPushToken}
            className={`p-3 rounded-lg ${
              expoPushToken ? 'bg-purple-500' : 'bg-gray-300'
            }`}
          >
            <Text className="text-white text-center font-medium">
              Send Order Notification
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSendInventoryNotification}
            disabled={!expoPushToken}
            className={`p-3 rounded-lg ${
              expoPushToken ? 'bg-orange-500' : 'bg-gray-300'
            }`}
          >
            <Text className="text-white text-center font-medium">
              Send Inventory Alert
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <Text className="text-yellow-800 text-sm font-medium mb-2">
            Instructions:
          </Text>
          <Text className="text-yellow-700 text-xs leading-relaxed">
            1. Make sure you're running on a physical device (not emulator){'\n'}
            2. Allow notification permissions when prompted{'\n'}
            3. Copy the Expo Push Token to use with expo.dev/notifications{'\n'}
            4. Test notifications using the buttons above
          </Text>
        </View>
      </View>
    </ScrollView>
    </View>
  );
};
