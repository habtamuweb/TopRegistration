const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing API Endpoints...\n');

  // Test factory purchase
  try {
    const factoryPurchase = {
      factoryName: 'Test Factory',
      quantities: { '8mm': 100, '12mm': 50 },
      date: new Date().toISOString().split('T')[0]
    };

    console.log('1. Testing Factory Purchase...');
    const factoryResponse = await fetch(`${API_BASE}/factory-purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(factoryPurchase)
    });
    console.log('Factory Purchase Status:', factoryResponse.status);
    console.log('Factory Purchase Result:', await factoryResponse.json());
  } catch (error) {
    console.log('Factory Purchase Error:', error.message);
  }

  // Test purchase
  try {
    const purchase = {
      factory: 'Test Factory',
      driverName: 'Test Driver',
      plateNo: 'ABC123',
      quantities: { '8mm': 50, '16mm': 25 },
      date: new Date().toISOString().split('T')[0]
    };

    console.log('\n2. Testing Purchase...');
    const purchaseResponse = await fetch(`${API_BASE}/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchase)
    });
    console.log('Purchase Status:', purchaseResponse.status);
    console.log('Purchase Result:', await purchaseResponse.json());
  } catch (error) {
    console.log('Purchase Error:', error.message);
  }

  // Test sale
  try {
    const sale = {
      customer: 'Test Customer',
      plate: 'XYZ789',
      fs: 'FS001',
      quantities: { '8mm': 10, '12mm': 5 },
      date: new Date().toISOString().split('T')[0]
    };

    console.log('\n3. Testing Sale...');
    const saleResponse = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale)
    });
    console.log('Sale Status:', saleResponse.status);
    console.log('Sale Result:', await saleResponse.json());
  } catch (error) {
    console.log('Sale Error:', error.message);
  }
}

testAPI();