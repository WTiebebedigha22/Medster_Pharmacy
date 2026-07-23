import { api } from './api';

export const testIRECIntegration = async () => {
  console.log('🚀 Testing IREC API Integration...');
  
  try {
    // Test 1: Get products
    console.log('\n📦 Testing getProducts...');
    const products = await api.getProducts({ limit: 5 });
    console.log(`✅ Found ${products.products.length} products`);
    if (products.products.length > 0) {
      console.log('Sample product:', {
        id: products.products[0].id,
        name: products.products[0].name,
        price: products.products[0].price,
      });
    }

    // Test 2: Get single product
    if (products.products.length > 0) {
      console.log('\n🔍 Testing getProduct...');
      const product = await api.getProduct(products.products[0].id);
      if (product) {
        console.log('✅ Product details:', {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          inStock: product.inStock,
        });
      }
    }

    // Test 3: Search products
    console.log('\n🔎 Testing searchProducts...');
    const searchResults = await api.searchProducts('vitamin');
    console.log(`✅ Found ${searchResults.products.length} products matching 'vitamin'`);

    // Test 4: Get categories
    console.log('\n📂 Testing getCategories...');
    const categories = await api.getCategories();
    console.log(`✅ Found ${categories.length} categories`);

    console.log('\n✅ All tests passed! IREC API integration is working.\n');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run in browser console
if (typeof window !== 'undefined') {
  window.testIREC = testIRECIntegration;
  console.log('💡 Run testIREC() in console to test IREC integration');
}