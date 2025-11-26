require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Use Atlas connection string from environment or local fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rebar-management';

async function forceResetRoles() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    });
    
    console.log('✅ Connected to MongoDB successfully');

    // Define the schema
    const rebarDataSchema = new mongoose.Schema({
      type: String,
      username: String,
      password: String,
      role: String,
      customer: String,
      plate: String,
      fs: String,
      factory: String,
      driverName: String,
      plateNo: String,
      factoryName: String,
      quantities: Object,
      shipped: Boolean,
      shippedQuantities: Object,
      shipmentCount: Number,
      lastShipmentDate: String,
      date: String,
      createdBy: String,
      createdAt: Date
    }, { collection: 'rebar_data' });

    const RebarData = mongoose.model('RebarData', rebarDataSchema);

    // Delete all existing users
    const deleteResult = await RebarData.deleteMany({ type: 'user' });
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing users`);

    // Create users with correct roles
    const defaultUsers = [
      { username: 'habte', password: 'h12', role: 'admin' },
      { username: 'ha12', password: 'h12', role: 'user' }
    ];

    for (const userData of defaultUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new RebarData({
        type: 'user',
        username: userData.username,
        password: hashedPassword,
        role: userData.role
      });
      
      await user.save();
      console.log(`✅ Created user: ${userData.username} with role: ${userData.role}`);
    }

    console.log('✅ Database roles reset completed successfully');
    console.log('🔐 Default users:');
    console.log('   - habte / h12 (admin)');
    console.log('   - ha12 / h12 (user)');
    
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database roles:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   1. Make sure MongoDB is running: mongod');
    console.log('   2. Or use MongoDB Atlas cloud database');
    console.log('   3. Check your connection string in .env file');
    console.log('   4. Create data directories: mkdir C:\\data\\db');
    process.exit(1);
  }
}

forceResetRoles();