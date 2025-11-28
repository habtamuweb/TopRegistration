require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://habte:1234@ac-0c7cjxp-shard-00-00.h6usazx.mongodb.net:27017,ac-0c7cjxp-shard-00-01.h6usazx.mongodb.net:27017,ac-0c7cjxp-shard-00-02.h6usazx.mongodb.net:27017/yegna?ssl=true&replicaSet=atlas-ujr5vq-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function testDatabase() {
  try {
    console.log('🧪 Testing MongoDB connection...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connection successful!');
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections in database:');
    collections.forEach(collection => {
      console.log('   -', collection.name);
    });
    
    // Check if users collection exists and has data
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      password: String,
      role: String,
      name: String
    }));
    
    const userCount = await User.countDocuments();
    console.log(`📊 Found ${userCount} users in database`);
    
    if (userCount > 0) {
      const users = await User.find({}, 'username role name password');
      console.log('👥 Existing users:');
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.role}) - Username: ${user.username}, Password: ${user.password}`);
      });
    } else {
      console.log('❌ No users found in database. You need to run the setup.');
    }
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check your internet connection');
    console.log('2. Verify MongoDB Atlas credentials are correct');
    console.log('3. Make sure your IP is whitelisted in MongoDB Atlas');
    console.log('4. Check if the database "yegna" exists in your cluster');
  } finally {
    mongoose.connection.close();
  }
}

testDatabase();