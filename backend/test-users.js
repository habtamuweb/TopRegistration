require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function testUsers() {
  try {
    console.log('🔍 Testing users in database...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB Atlas');

    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      password: String,
      role: String,
      name: String
    }));

    const users = await User.find({});
    console.log(`📊 Found ${users.length} users:`);
    
    users.forEach(user => {
      console.log(`   👤 ${user.name} (${user.role}) - Username: ${user.username} / Password: ${user.password}`);
    });

    // Test login for each user
    console.log('\n🔐 Testing logins:');
    for (const user of users) {
      const foundUser = await User.findOne({ 
        username: user.username, 
        password: user.password 
      });
      
      if (foundUser) {
        console.log(`   ✅ ${user.name}: Login successful`);
      } else {
        console.log(`   ❌ ${user.name}: Login failed`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testUsers();