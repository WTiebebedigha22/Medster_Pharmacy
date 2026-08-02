import { api } from './api';

export const testIRECIntegration = async () => {
  console.log('[IREC] Testing IREC API Integration...');
  
  try {
    // Test 1: Get products
    console.log('\n[IREC] Testing getProducts...');
    const products = await api.getProducts({ limit: 5 });
    console.log(`[IREC] Found ${products.products.length} products`);
    if (products.products.length > 0) {
      console.log('Sample product:', {
        id: products.products[0].id,
        name: products.products[0].name,
        price: products.products[0].price,
      });
    }

    // Test 2: Get single product
    if (products.products.length > 0) {
      console.log('\n[IREC] Testing getProduct...');
      const product = await api.getProduct(products.products[0].id);
      if (product) {
        console.log('[IREC] Product details:', {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          inStock: product.inStock,
        });
      }
    }

    // Test 3: Search products
    console.log('\n[IREC] Testing searchProducts...');
    const searchResults = await api.searchProducts('vitamin');
    console.log(`[IREC] Found ${searchResults.products.length} products matching 'vitamin'`);

    // Test 4: Get categories
    console.log('\n[IREC] Testing getCategories...');
    const categories = await api.getCategories();
    console.log(`[IREC] Found ${categories.length} categories`);

    console.log('\n[IREC] All tests passed! IREC API integration is working.\n');
  } catch (error) {
    console.error('[IREC] Test failed:', error.message);
  }
};

// Run in browser console
if (typeof window !== 'undefined') {
  window.testIREC = testIRECIntegration;
  console.log('[IREC] Run testIREC() in console to test IREC integration');
}

