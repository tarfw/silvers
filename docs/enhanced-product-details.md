# Enhanced Product Details

The product details component has been enhanced to display comprehensive product information including metafields, brand, vendor, and type information.

## Features Added

### 1. Product Information Section
- **Brand**: Displays the product's brand name
- **Vendor**: Shows the vendor/supplier information  
- **Type**: Product type/category classification
- **SKU**: Product or variant SKU code

### 2. Metafields Display
- Automatically displays all metafields associated with the product
- Smart formatting for different data types:
  - Booleans: Displayed as "Yes/No"
  - Objects/Arrays: Formatted JSON display
  - Null/Undefined: Shows "N/A"
  - Strings/Numbers: Direct display
- Key names are automatically formatted (camelCase → Title Case, underscores → spaces)

### 3. Enhanced Data Queries
- Added relationship queries for brand, vendor, and type
- Maintains existing functionality for product variants and options
- Optimized queries to fetch related data efficiently

## Usage

The enhanced component works with the existing `ProductDetailsScreen` interface:

```tsx
import ProductDetailsScreen from '../components/product-details';

// Your product data structure
const product = {
  id: 'product-123',
  title: 'Sample Product',
  description: 'Product description...',
  price: 99.99,
  sku: 'PROD-123',
  
  // Metafields for additional information
  metafields: {
    material: 'Cotton',
    care_instructions: 'Machine wash cold',
    origin: 'Made in USA',
    is_organic: true,
    certifications: ['GOTS', 'Fair Trade']
  }
};

// Use the component
<ProductDetailsScreen
  product={product}
  onClose={() => {/* handle close */}}
/>
```

## Data Structure Requirements

### Product Object
The product object should include:
- Standard product fields (id, title, description, price, etc.)
- Optional `metafields` object with key-value pairs
- Optional `sku` field for product-level SKU

### Database Relationships
The component automatically queries for:
- `brand` relationship via `brandId`
- `vendor` relationship via `vendorId`  
- `type` relationship via `typeId`

### Metafields Structure
Metafields should be a flat object with string keys:

```typescript
metafields: {
  material: string,
  care_instructions: string,
  origin: string,
  is_organic: boolean,
  certifications: string[],
  // ... any other custom fields
}
```

## Styling

The enhanced sections use consistent styling:
- Gray background containers for grouped information
- Consistent spacing and typography
- Responsive layout that works on different screen sizes
- Accessible color contrast and font sizes

## Examples

See the following files for implementation examples:
- `src/components/product-details-demo.tsx` - Demo with sample data
- `src/examples/enhanced-product-details-usage.tsx` - Usage examples

## Migration Notes

This enhancement is backward compatible. Existing products without metafields, brand, vendor, or type information will continue to work as before. The new sections only appear when the relevant data is available.