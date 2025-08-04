import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { addressService, Address } from '../services/address-service';
import { db } from '../lib/instant';

interface AddressSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectAddress: (address: Address) => void;
  onAddNewAddress: () => void;
  selectedAddress?: Address | null;
}

export default function AddressSelector({
  visible,
  onClose,
  onSelectAddress,
  onAddNewAddress,
  selectedAddress
}: AddressSelectorProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Use InstantDB's reactive query for addresses
  const { data, isLoading } = db.useQuery(
    user?.id && visible ? {
      addresses: {
        $: {
          where: {
            userId: user.id
          }
        }
      }
    } : null
  );

  const addresses = data?.addresses || [];

  const formatAddress = (address: Address) => {
    const parts = [
      address.street,
      `${address.city}, ${address.state} ${address.zipCode}`,
      address.country || 'India'
    ].filter(Boolean);

    return parts.join('\n');
  };

  const isAddressSelected = (address: Address) => {
    if (!selectedAddress) return false;
    return JSON.stringify(address) === JSON.stringify(selectedAddress);
  };

  const handleSelectAddress = (address: Address) => {
    onSelectAddress(address);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose} className="mr-4">
              <Text className="text-blue-600 text-base">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900 flex-1 text-center">
              Select Address
            </Text>
            <TouchableOpacity onPress={onAddNewAddress}>
              <Feather name="plus" size={24} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
          <View className="px-4 py-4">
            {isLoading ? (
              <View className="py-12">
                <Text className="text-center text-gray-500">Loading addresses...</Text>
              </View>
            ) : addresses.length === 0 ? (
              <View className="py-12">
                <View className="items-center">
                  <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                    <Feather name="map-pin" size={24} color="#9CA3AF" />
                  </View>
                  <Text className="text-lg font-medium text-gray-900 mb-2">
                    No addresses saved
                  </Text>
                  <Text className="text-gray-500 text-center mb-6">
                    Add your first delivery address to continue
                  </Text>
                  <TouchableOpacity
                    onPress={onAddNewAddress}
                    className="bg-blue-600 rounded-lg px-6 py-3"
                  >
                    <Text className="text-white font-medium">Add Address</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              addresses.map((address, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelectAddress(address)}
                  className={`bg-white border rounded-xl p-4 mb-3 ${
                    isAddressSelected(address) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-gray-900 mb-2">
                        {address.name}
                      </Text>
                      <Text className="text-sm text-gray-700 leading-5 mb-2">
                        {address.street}
                      </Text>
                      <Text className="text-sm text-gray-700 mb-2">
                        {address.city}, {address.state} - {address.zipCode}
                      </Text>
                      <Text className="text-sm text-gray-700 mb-2">
                        {address.country || 'India'}
                      </Text>
                      {address.phone && (
                        <Text className="text-sm text-gray-600 mb-2">
                          📞 {address.phone}
                        </Text>
                      )}
                      {address.gst && (
                        <View className="bg-blue-50 px-3 py-2 rounded-lg mt-2">
                          <Text className="text-xs text-blue-600 font-medium mb-1">GST Number</Text>
                          <Text className="text-sm text-blue-800 font-mono">
                            {address.gst}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View className="ml-3">
                      {isAddressSelected(address) ? (
                        <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                          <Feather name="check" size={16} color="white" />
                        </View>
                      ) : (
                        <View className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                      )}
                    </View>
                  </View>
                  
                  {address.isDefault && (
                    <View className="flex-row justify-end">
                      <View className="bg-green-100 px-2 py-1 rounded-full">
                        <Text className="text-xs font-medium text-green-800">Default</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
