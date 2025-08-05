import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrency, db } from '../lib/instant';
import { useCart } from '../lib/cart-context';
import { useFavorites } from '../hooks/useFavorites';
import { useToast } from './ui/toast';
import R2Image from './ui/r2-image';
import ZoomableImage from './ui/zoomable-image';
import QuantitySelector from './ui/qty';

const { width: screenWidth } = Dimensions.get('window');

interface ProductDetailsProps {
  product: any;
  onClose: () => void;
}

interface ProductOption {
  name: string;
  values: string[];
}

export default function ProductDetailsScreen({ product, onClose }: ProductDetailsProps) {
  const insets = useSafeAreaInsets();
  const { addItem } = useCart();
  const { isFavorited, toggleFavorite, isLoading: favoritesLoading } = useFavorites();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isProductFavorited = isFavorited(product.id);

  // Query product items (variants)
  const { data: itemData } = db.useQuery({
    items: {
      $: {
        where: {
          productId: product.id
        }
      }
    }
  });

  // Query product with relationships (brand, vendor, type)
  const { data: productData } = db.useQuery({
    products: {
      $: {
        where: {
          id: product.id
        }
      }
    }
  });

  // Get the product with full data
  const fullProduct = productData?.products?.[0] || product;

  // Query brand if brandId exists
  const { data: brandData } = db.useQuery(
    fullProduct.brandId ? {
      brands: {
        $: {
          where: {
            id: fullProduct.brandId
          }
        }
      }
    } : null
  );

  // Query vendor if vendorId exists
  const { data: vendorData } = db.useQuery(
    fullProduct.vendorId ? {
      vendors: {
        $: {
          where: {
            id: fullProduct.vendorId
          }
        }
      }
    } : null
  );

  // Query type if typeId exists
  const { data: typeData } = db.useQuery(
    fullProduct.typeId ? {
      types: {
        $: {
          where: {
            id: fullProduct.typeId
          }
        }
      }
    } : null
  );

  const items = itemData?.items || [];
  
  // Get brand, vendor, and type names from separate queries
  const brandName = brandData?.brands?.[0]?.name;
  const vendorName = vendorData?.vendors?.[0]?.name;
  const typeName = typeData?.types?.[0]?.name;



  // Extract product options from items
  const productOptions: ProductOption[] = React.useMemo(() => {
    const options: ProductOption[] = [];
    const optionMap: Record<string, Set<string>> = {};

    items.forEach(item => {
      if (item.option1) {
        if (!optionMap.option1) optionMap.option1 = new Set();
        optionMap.option1.add(item.option1);
      }
      if (item.option2) {
        if (!optionMap.option2) optionMap.option2 = new Set();
        optionMap.option2.add(item.option2);
      }
      if (item.option3) {
        if (!optionMap.option3) optionMap.option3 = new Set();
        optionMap.option3.add(item.option3);
      }
    });

    // Convert to array format with proper names
    if (optionMap.option1) {
      options.push({
        name: 'Size', // You can customize this based on your product types
        values: Array.from(optionMap.option1)
      });
    }
    if (optionMap.option2) {
      options.push({
        name: 'Color',
        values: Array.from(optionMap.option2)
      });
    }
    if (optionMap.option3) {
      options.push({
        name: 'Material',
        values: Array.from(optionMap.option3)
      });
    }

    return options;
  }, [items]);

  // Find matching item based on selected options
  useEffect(() => {
    if (items.length === 0) return;

    if (productOptions.length === 0) {
      // No options, use first item
      setSelectedItem(items[0]);
      return;
    }

    // Find item that matches ALL selected options exactly
    const matchingItem = items.find(item => {
      // Get the option names and their corresponding item properties
      const optionMappings = {
        'Size': 'option1',
        'Color': 'option2', 
        'Material': 'option3'
      };

      // Check if all selected options match the item
      return Object.entries(selectedOptions).every(([optionName, selectedValue]) => {
        const itemProperty = optionMappings[optionName as keyof typeof optionMappings];
        if (!itemProperty) return true; // Skip unknown options
        return item[itemProperty] === selectedValue;
      });
    });

    console.log('Selected options:', selectedOptions);
    console.log('Matching item:', matchingItem);
    setSelectedItem(matchingItem || items[0]);
  }, [selectedOptions, items, productOptions]);

  // Auto-select first option for each category if none selected
  useEffect(() => {
    if (productOptions.length === 0) return;
    
    const newSelectedOptions: Record<string, string> = {};
    
    productOptions.forEach(option => {
      if (!selectedOptions[option.name] && option.values.length > 0) {
        newSelectedOptions[option.name] = option.values[0];
      }
    });
    
    if (Object.keys(newSelectedOptions).length > 0) {
      console.log('Auto-selecting options:', newSelectedOptions);
      setSelectedOptions(prev => ({ ...prev, ...newSelectedOptions }));
    }
  }, [productOptions]);

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value
    }));
  };

  // Calculate current price and discount based on selected item
  const currentPrice = selectedItem?.price || product.price || 0;
  const salePrice = selectedItem?.saleprice || product.saleprice;
  const hasDiscount = salePrice && salePrice > 0 && salePrice < currentPrice;
  const displayPrice = hasDiscount ? salePrice : currentPrice;

  // Debug logging for price updates
  useEffect(() => {
    console.log('Price update:', {
      selectedItem: selectedItem?.id,
      selectedItemPrice: selectedItem?.price,
      selectedItemSalePrice: selectedItem?.saleprice,
      productPrice: product.price,
      currentPrice,
      salePrice,
      hasDiscount,
      displayPrice
    });
  }, [selectedItem, currentPrice, salePrice, hasDiscount, displayPrice]);

  const handleAddToCart = async () => {
    if (!selectedItem) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please select product options'
      });
      return;
    }

    setIsLoading(true);
    try {
      await addItem({
        productId: product.id,
        itemId: selectedItem.id,
        title: product.title,
        price: displayPrice, // Use the display price (sale price if available)
        quantity: quantity,
        sku: selectedItem.sku || product.sku || '',
        image: product.image,
        options: selectedOptions
      });

      showToast({
        type: 'success',
        title: 'Added to Cart',
        message: `${product.title} has been added to your cart`,
        duration: 3000
      });
      
      // Close the product details after a short delay to let user see the toast
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add item to cart'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={onClose} className="mr-4">
            <Feather name="arrow-left" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 flex-1" numberOfLines={1}>
            {product.title}
          </Text>
          <TouchableOpacity 
            className="ml-4 bg-white p-2 rounded-full shadow-sm"
            onPress={() => toggleFavorite(product.id, product.title)}
            disabled={favoritesLoading}
          >
            <Feather 
              name="heart" 
              size={20} 
              color={isProductFavorited ? "#EF4444" : "#D1D5DB"}
              fill={isProductFavorited ? "#EF4444" : "transparent"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Product Image - Zoomable */}
        <View className="bg-gray-50 relative" style={{ height: screenWidth }}>
          {product.image ? (
            <>
              <ZoomableImage
                url={product.image}
                style={{ width: '100%', height: '100%' }}
                maxZoom={4}
                minZoom={1}
                fallback={
                  <View className="w-full h-full bg-gray-100 items-center justify-center">
                    <MaterialCommunityIcons name="diamond-stone" size={64} color="#9CA3AF" />
                  </View>
                }
              />
              {/* Touch gesture hint */}
              <View className="absolute top-4 right-4 bg-black/60 rounded-lg px-3 py-2">
                <Text className="text-white text-xs font-medium">Pinch to zoom</Text>
              </View>
            </>
          ) : (
            <View className="w-full h-full bg-gray-100 items-center justify-center">
              <MaterialCommunityIcons name="diamond-stone" size={64} color="#9CA3AF" />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="px-6 py-6">
          {/* Title and Price */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {product.title}
            </Text>
            
            {/* Only show price if it's greater than 0 */}
            {displayPrice > 0 && (
              <View className="flex-row items-center">
                {!selectedItem ? (
                  <Text className="text-2xl font-bold text-gray-400">
                    Select options to see price
                  </Text>
                ) : hasDiscount ? (
                  <>
                    <Text className="text-2xl font-bold text-red-600 mr-3">
                      {formatCurrency(salePrice)}
                    </Text>
                    <Text className="text-lg text-gray-500 line-through">
                      {formatCurrency(currentPrice)}
                    </Text>
                    <View className="ml-2 bg-red-100 px-2 py-1 rounded">
                      <Text className="text-red-600 text-xs font-medium">
                        SALE
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text className="text-2xl font-bold text-gray-900">
                    {formatCurrency(displayPrice)}
                  </Text>
                )}
              </View>
            )}

          </View>

          {/* Brand and Vendor */}
          {(brandName || vendorName) && (
            <View className="mb-6">
              <View className="flex-row items-center space-x-4">
                {brandName && (
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">Brand</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      {brandName}
                    </Text>
                  </View>
                )}
                {vendorName && (
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vendor</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      {vendorName}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Product Information */}
          {(typeName || fullProduct.sku || selectedItem?.sku) && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Product Information
              </Text>
              <View className="space-y-3">
                {typeName && (
                  <View className="flex-row items-center py-2">
                    <Text className="text-sm font-medium text-gray-600 w-24">Type:</Text>
                    <Text className="text-sm text-gray-900 flex-1">{typeName}</Text>
                  </View>
                )}
                {(selectedItem?.sku || fullProduct.sku) && (
                  <View className="flex-row items-center py-2">
                    <Text className="text-sm font-medium text-gray-600 w-24">SKU:</Text>
                    <Text className="text-sm text-gray-900 flex-1 font-mono">
                      {selectedItem?.sku || fullProduct.sku}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Product Description */}
          {(fullProduct.description || fullProduct.excerpt) && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </Text>
              <Text className="text-base text-gray-700 leading-6">
                {fullProduct.description || fullProduct.excerpt}
              </Text>
            </View>
          )}

          {/* Metafields */}
          {fullProduct.metafields && Object.keys(fullProduct.metafields).length > 0 && (
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                Additional Information
              </Text>
              <View className="space-y-3">
                {Object.entries(fullProduct.metafields).map(([key, value]) => {
                  // Format the key to be more readable
                  const formattedKey = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .replace(/_/g, ' ');

                  // Extract the actual value from metafield structure
                  let displayValue: string;
                  
                  if (value === null || value === undefined) {
                    displayValue = 'N/A';
                  } else if (typeof value === 'object' && value !== null) {
                    // Handle metafield object structure like { type: "single_line_text", group: "General", value: "50" }
                    if ('value' in value) {
                      displayValue = String(value.value);
                    } else if (Array.isArray(value)) {
                      displayValue = value.join(', ');
                    } else {
                      displayValue = JSON.stringify(value);
                    }
                  } else if (typeof value === 'boolean') {
                    displayValue = value ? 'Yes' : 'No';
                  } else {
                    displayValue = String(value);
                  }

                  return (
                    <View key={key} className="flex-row items-center py-2">
                      <Text className="text-sm font-medium text-gray-600 w-24">
                        {formattedKey}:
                      </Text>
                      <Text className="text-sm text-gray-900 flex-1 ml-2">
                        {displayValue}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Product Options */}
          {productOptions.map((option, index) => (
            <View key={index} className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                {option.name}
              </Text>
              <View className="flex-row flex-wrap">
                {option.values.map((value) => {
                  const isSelected = selectedOptions[option.name] === value;
                  return (
                    <TouchableOpacity
                      key={value}
                      onPress={() => handleOptionSelect(option.name, value)}
                      className={`mr-3 mb-3 px-4 py-3 rounded-lg border-2 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <Text
                        className={`font-medium ${
                          isSelected ? 'text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Quantity Selector */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Quantity
            </Text>
            <QuantitySelector
              value={quantity}
              onValueChange={setQuantity}
              min={1}
              max={99}
              size="medium"
            />
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View 
        className="px-6 py-4 bg-white border-t border-gray-100"
        style={{ paddingBottom: Math.max(16, insets.bottom) }}
      >
        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={isLoading || !selectedItem}
          className={`py-4 rounded-lg items-center ${
            isLoading || !selectedItem ? 'bg-gray-400' : 'bg-blue-600'
          }`}
        >
          <Text className="text-white font-semibold text-lg">
            {isLoading ? 'Adding...' : 
             !selectedItem ? 'Select Options' :
             displayPrice > 0 ? `Add to Cart • ${formatCurrency(displayPrice * quantity)}` : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
