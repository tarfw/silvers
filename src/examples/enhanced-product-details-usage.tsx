import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import ProductDetailsScreen from '../components/product-details';

// Example of how to use the enhanced product details component
export default function EnhancedProductDetailsExample() {
  const [showProductDetails, setShowProductDetails] = useState(false);

  // Example product data structure with all the enhanced fields
  const sampleProduct = {
    id: 'sample-product-123',
    title: 'Artisan Coffee Blend',
    description: 'A premium blend of single-origin coffee beans from Ethiopia and Colombia, roasted to perfection.',
    price: 24.99,
    saleprice: 19.99,
    image: 'https://example.com/coffee-bag.jpg',
    sku: 'COFFEE-BLEND-001',
    
    // Metafields for additional product information
    metafields: {
      origin: 'Ethiopia & Colombia',
      roast_level: 'Medium',
      flavor_notes: 'Chocolate, Citrus, Floral',
      processing_method: 'Washed',
      altitude: '1,200-1,800m',
      harvest_date: '2024-03',
      certification: 'Fair Trade & Organic',
      caffeine_content: 'High',
      brewing_methods: ['Pour Over', 'French Press', 'Espresso'],
      storage_instructions: 'Store in a cool, dry place away from direct sunlight',
      net_weight: '12 oz (340g)',
      is_decaf: false,
      sustainability_score: 9.2
    }
  };

  if (showProductDetails) {
    return (
      <ProductDetailsScreen
        product={sampleProduct}
        onClose={() => setShowProductDetails(false)}
      />
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold text-gray-900 mb-4">
        Enhanced Product Details Demo
      </Text>
      
      <Text className="text-gray-700 mb-6 leading-6">
        This example demonstrates the enhanced product details component that now displays:
      </Text>

      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-3">Features:</Text>
        <View className="space-y-2">
          <Text className="text-gray-700">• Brand information</Text>
          <Text className="text-gray-700">• Vendor details</Text>
          <Text className="text-gray-700">• Product type</Text>
          <Text className="text-gray-700">• SKU display</Text>
          <Text className="text-gray-700">• Metafields with formatted display</Text>
          <Text className="text-gray-700">• Enhanced product information section</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => setShowProductDetails(true)}
        className="bg-blue-600 py-4 px-6 rounded-lg items-center"
      >
        <Text className="text-white font-semibold text-lg">
          View Enhanced Product Details
        </Text>
      </TouchableOpacity>

      <View className="mt-8 p-4 bg-gray-50 rounded-lg">
        <Text className="text-sm font-medium text-gray-900 mb-2">
          Sample Metafields Structure:
        </Text>
        <Text className="text-xs text-gray-600 font-mono">
          {JSON.stringify(sampleProduct.metafields, null, 2)}
        </Text>
      </View>
    </ScrollView>
  );
}