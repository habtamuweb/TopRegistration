const mongoose = require('mongoose');
require('dotenv').config();

// Test the database connection and models
async function testBackend() {
  console.log('🧪 Testing Backend Configuration...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rebar_system', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');

    // Test models
    const Purchase = require('./models/Purchase');
    const Sale = require('./models/Sale');
    const FactoryPurchase = require('./models/FactoryPurchase');

    console.log('✅ All models loaded successfully');

    // Test creating a purchase
    console.log('\n🧪 Testing Purchase Creation...');
    const testPurchase = new Purchase({
      factory: 'Test Factory',
      driverName: 'Test Driver',
      plateNo: 'TEST123',
      quantities: {
        '8mm': 100,
        '12mm': 50,
        '16mm': 25
      },
      date: new Date()
    });

    const savedPurchase = await testPurchase.save();
    console.log('✅ Purchase created successfully:', savedPurchase._id);

    // Test creating a sale
    console.log('\n🧪 Testing Sale Creation...');
    const testSale = new Sale({
      customer: 'Test Customer',
      plate: 'CUST456',
      fs: 'FS001',
      quantities: {
        '8mm': 50,
        '10mm': 25
      },
      date: new Date()
    });

    const savedSale = await testSale.save();
    console.log('✅ Sale created successfully:', savedSale._id);

    // Clean up test data
    await Purchase.findByIdAndDelete(savedPurchase._id);
    await Sale.findByIdAndDelete(savedSale._id);
    console.log('\n🧹 Test data cleaned up');

    console.log('\n🎉 All backend tests passed!');
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testBackend();