import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import ProductDetailsScreen from './product-details';

// Demo product with metafields, brand, vendor data
const demoProduct = {
  id: 'demo-product-1',
  title: 'Premium Diamond Ring',
  description: 'A beautiful 18k gold diamond ring with exceptional clarity and brilliance. Perfect for engagements or special occasions.',
  price: 2500,
  saleprice: 2200,
  image: 'https://example.com/diamond-ring.jpg',
  sku: 'DR-18K-001',
  metafields: {
    material: '18k Gold',
    gemstone: 'Diamond',
    carat_weight: '1.5ct',
    clarity: 'VS1',
    color_grade: 'G',
    cut: 'Round Brilliant',
    certification: 'GIA Certified',
    warranty: '2 Years',
    care_instructions: 'Clean with mild soap and water. Store separately to avoid scratches.',
    origin: 'Ethically Sourced',
    is_customizable: true,
    engraving_available: true
  },
  // These would be populated by the query in the actual component
  brand: [{ name: 'Luxury Jewels Co.' }],
  vendor: [{ name: 'Diamond Wholesale Inc.' }],
  type: [{ name: 'Fine Jewelry' }]
};

interface ProductDetailsDemoProps {
  onClose: () => void;
}

export default function ProductDetailsDemo({ onClose }: ProductDetailsDemoProps) {
  return (
    <ProductDetailsScreen 
      product={demoProduct}
      onClose={onClose}
    />
  );
}