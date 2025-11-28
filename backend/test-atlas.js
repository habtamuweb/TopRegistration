require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function testAtlasConnection() {
  try {
    console.log('🧪 Testing MongoDB Atlas connection...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB Atlas connection successful!');
    
    // Check if users exist
    const User = mongoose.model('User', new mongoose.Schema({}));
    const userCount = await User.countDocuments();
    console.log(`📊 Found ${userCount} users in database`);
    
    if (userCount > 0) {
      const users = await User.find({}, 'username role name');
      console.log('👥 Existing users:');
      users.forEach(user => console.log(`   - ${user.name} (${user.role})`));
    }
    
  } catch (error) {
    console.error('❌ Atlas connection test failed:', error.message);
    console.log('💡 Check your .env file and IP whitelist in MongoDB Atlas');
  } finally {
    mongoose.connection.close();
  }
}

testAtlasConnection();