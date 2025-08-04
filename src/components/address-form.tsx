import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { addressService, CreateAddressData, Address } from '../services/address-service';

interface AddressFormProps {
  onClose: () => void;
  onSave?: () => void;
  address?: Address & { id?: string };
  isEditing?: boolean;
}

export default function AddressForm({ onClose, onSave, address, isEditing = false }: AddressFormProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: '',
    gst: '',
    isDefault: false
  });

  // Initialize form with existing address data
  useEffect(() => {
    if (address) {
      setFormData({
        name: address.name || '',
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: 'India', // Always set to India
        phone: address.phone || '',
        gst: address.gst || '',
        isDefault: address.isDefault || false
      });
    }
  }, [address]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.street?.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!formData.city?.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state?.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.zipCode?.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    if (!formData.gst?.trim()) {
      newErrors.gst = 'GST number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setIsLoading(true);

    try {
      const addressData: CreateAddressData = {
        name: formData.name,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        phone: formData.phone,
        gst: formData.gst,
        isDefault: formData.isDefault,
      };

      let result;
      if (isEditing && address?.id) {
        // Update existing address
        result = await addressService.updateAddress(address.id, addressData);
      } else {
        // Create new address
        result = await addressService.createAddress(user.id, addressData);
      }

      if (result.success) {
        Alert.alert(
          'Success',
          isEditing ? 'Address updated successfully' : 'Address added successfully',
          [{ text: 'OK', onPress: () => { onSave?.(); onClose(); } }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to save address');
      }

    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'white', paddingTop: insets.top }}
    >
      {/* Header */}
      <View style={{ 
        backgroundColor: 'white', 
        paddingHorizontal: 16, 
        paddingVertical: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: '#E5E7EB' 
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={onClose} style={{ marginRight: 16 }}>
            <Feather name="x" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', flex: 1 }}>
            {isEditing ? 'Edit Address' : 'Add Address'}
          </Text>
          <TouchableOpacity 
            onPress={handleSave} 
            disabled={isLoading}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: isLoading ? '#D1D5DB' : '#3B82F6'
            }}
          >
            <Text style={{ 
              fontWeight: '500', 
              color: isLoading ? '#6B7280' : 'white' 
            }}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16 }}>
          {/* Personal Information */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
              Contact Information
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Full Name <Text style={{ color: '#EF4444' }}> *</Text>
              </Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
                placeholder="John Doe"
                style={{
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: errors.name ? '#FCA5A5' : '#E5E7EB'
                }}
              />
              {errors.name && (
                <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.name}</Text>
              )}
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Phone <Text style={{ color: '#EF4444' }}> *</Text>
              </Text>
              <TextInput
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
                style={{
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: errors.phone ? '#FCA5A5' : '#E5E7EB'
                }}
              />
              {errors.phone && (
                <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.phone}</Text>
              )}
            </View>
          </View>

          {/* Address Information */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
              Address Information
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                Street Address <Text style={{ color: '#EF4444' }}> *</Text>
              </Text>
              <TextInput
                value={formData.street}
                onChangeText={(text) => updateField('street', text)}
                placeholder="123 Main Street"
                style={{
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: errors.street ? '#FCA5A5' : '#E5E7EB'
                }}
              />
              {errors.street && (
                <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.street}</Text>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                    City <Text style={{ color: '#EF4444' }}> *</Text>
                  </Text>
                  <TextInput
                    value={formData.city}
                    onChangeText={(text) => updateField('city', text)}
                    placeholder="Mumbai"
                    style={{
                      width: '100%',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      backgroundColor: 'white',
                      borderRadius: 8,
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: errors.city ? '#FCA5A5' : '#E5E7EB'
                    }}
                  />
                  {errors.city && (
                    <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.city}</Text>
                  )}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                    State <Text style={{ color: '#EF4444' }}> *</Text>
                  </Text>
                  <TextInput
                    value={formData.state}
                    onChangeText={(text) => updateField('state', text)}
                    placeholder="Maharashtra"
                    autoCapitalize="characters"
                    style={{
                      width: '100%',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      backgroundColor: 'white',
                      borderRadius: 8,
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: errors.state ? '#FCA5A5' : '#E5E7EB'
                    }}
                  />
                  {errors.state && (
                    <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.state}</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                    ZIP Code <Text style={{ color: '#EF4444' }}> *</Text>
                  </Text>
                  <TextInput
                    value={formData.zipCode}
                    onChangeText={(text) => updateField('zipCode', text)}
                    placeholder="400001"
                    autoCapitalize="characters"
                    style={{
                      width: '100%',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      backgroundColor: 'white',
                      borderRadius: 8,
                      fontSize: 16,
                      borderWidth: 1,
                      borderColor: errors.zipCode ? '#FCA5A5' : '#E5E7EB'
                    }}
                  />
                  {errors.zipCode && (
                    <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.zipCode}</Text>
                  )}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                    Country
                  </Text>
                  <View style={{
                    width: '100%',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    justifyContent: 'center'
                  }}>
                    <Text style={{ fontSize: 16, color: '#374151' }}>India</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* GST Number */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 }}>
                GST Number <Text style={{ color: '#EF4444' }}> *</Text>
              </Text>
              <TextInput
                value={formData.gst}
                onChangeText={(text) => updateField('gst', text)}
                placeholder="Enter GST number (e.g., 22AAAAA0000A1Z5)"
                autoCapitalize="characters"
                style={{
                  width: '100%',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: 'white',
                  borderRadius: 8,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: errors.gst ? '#FCA5A5' : '#E5E7EB'
                }}
              />
              {errors.gst && (
                <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.gst}</Text>
              )}
            </View>

            {/* Default Address Toggle */}
            <View style={{ marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => updateField('isDefault', !formData.isDefault)}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  borderWidth: 2,
                  marginRight: 12,
                  backgroundColor: formData.isDefault ? '#3B82F6' : 'transparent',
                  borderColor: formData.isDefault ? '#3B82F6' : '#D1D5DB',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {formData.isDefault && (
                    <Feather name="check" size={12} color="white" />
                  )}
                </View>
                <Text style={{ fontSize: 16, color: '#374151' }}>Set as default address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
