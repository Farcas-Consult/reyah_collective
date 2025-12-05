# Data Synchronization System

## Overview
The Reyah Collective platform includes a real-time data synchronization system that ensures all changes made by admins, sellers, or suppliers are immediately reflected across the entire website and all dashboards.

## How It Works

### 1. Sync Utility (`src/utils/dataSync.ts`)
The sync utility provides functions to save data with automatic event triggering:

```typescript
import { saveProductsWithSync, saveUsersWithSync, onDataSync, DATA_SYNC_EVENTS } from '@/utils/dataSync';

// Save products and notify all listeners
saveProductsWithSync(products);

// Save users and notify all listeners
saveUsersWithSync(users);

// Listen for product updates
useEffect(() => {
  const cleanup = onDataSync(DATA_SYNC_EVENTS.PRODUCTS_UPDATED, () => {
    // Reload your data here
    loadProducts();
  });
  
  return cleanup; // Cleanup on unmount
}, []);
```

### 2. Available Sync Functions

**Save Functions** (trigger updates automatically):
- `saveProductsWithSync(products)` - Save products and notify
- `saveUsersWithSync(users)` - Save users and notify
- `saveOrdersWithSync(orders)` - Save orders and notify
- `saveFlashSalesWithSync(sales)` - Save flash sales and notify
- `saveReviewsWithSync(reviews)` - Save reviews and notify

**Helper Functions**:
- `addProduct(product)` - Add new product with sync
- `updateProduct(id, updates)` - Update product with sync
- `deleteProduct(id)` - Delete product with sync
- `updateSellerProducts(userId, products)` - Update seller/supplier products

**Get Functions**:
- `getProducts()` - Get all products
- `getUsers()` - Get all users
- `getOrders()` - Get all orders

### 3. Event Names
```typescript
DATA_SYNC_EVENTS.PRODUCTS_UPDATED
DATA_SYNC_EVENTS.USERS_UPDATED
DATA_SYNC_EVENTS.ORDERS_UPDATED
DATA_SYNC_EVENTS.FLASH_SALES_UPDATED
DATA_SYNC_EVENTS.REVIEWS_UPDATED
```

## Usage Examples

### Admin Dashboard - Adding a Product
```typescript
import { saveProductsWithSync } from '@/utils/dataSync';

const handleAddProduct = () => {
  const newProduct = { /* product data */ };
  const updatedProducts = [...products, newProduct];
  
  // This will automatically notify shop page and other components
  saveProductsWithSync(updatedProducts);
  setProducts(updatedProducts);
};
```

### Shop Page - Listening for Updates
```typescript
import { onDataSync, DATA_SYNC_EVENTS } from '@/utils/dataSync';

useEffect(() => {
  // Listen for product updates from admin/seller/supplier
  const cleanup = onDataSync(DATA_SYNC_EVENTS.PRODUCTS_UPDATED, () => {
    loadProducts(); // Reload products when updated
  });
  
  return cleanup;
}, []);
```

### Seller Dashboard - Updating Products
```typescript
import { saveUsersWithSync, getUsers } from '@/utils/dataSync';

const handleUpdateSellerProduct = (product) => {
  const users = getUsers();
  const sellerIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (sellerIndex !== -1) {
    users[sellerIndex].products = updatedProducts;
    // This will notify shop page and other components
    saveUsersWithSync(users);
  }
};
```

## Benefits

1. **Real-time Updates**: Changes appear instantly across all pages
2. **No Page Refresh Needed**: Components update automatically
3. **Cross-tab Sync**: Updates work across multiple browser tabs
4. **Centralized Logic**: All data operations go through one system
5. **Type Safety**: TypeScript support for all functions

## Implementation Status

### ✅ Completed
- Admin Products Page - Uses `saveProductsWithSync`
- Shop Page - Listens for `PRODUCTS_UPDATED` events
- Data sync utility with all core functions

### 🔄 To Implement
- Seller Products Page
- Supplier Products Page
- Admin Sellers/Suppliers Management
- Product Detail Page
- Cart/Wishlist Updates
- Order Management

## Best Practices

1. **Always use sync functions** instead of direct localStorage.setItem
2. **Clean up listeners** in useEffect return functions
3. **Reload data** when sync events are triggered
4. **Handle errors** gracefully when loading data
5. **Debounce rapid updates** if needed for performance

## Migration Guide

To migrate existing code:

**Before:**
```typescript
localStorage.setItem('reyah_products', JSON.stringify(products));
```

**After:**
```typescript
import { saveProductsWithSync } from '@/utils/dataSync';
saveProductsWithSync(products);
```

## Future Enhancements

- Database integration for persistent storage
- WebSocket support for real-time multi-user collaboration
- Conflict resolution for simultaneous edits
- Offline support with sync queue
- Audit trail for all data changes
