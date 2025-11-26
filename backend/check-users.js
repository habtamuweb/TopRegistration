// check-users.js
require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      password: String,
      role: String,
      name: String
    }));

    const users = await User.find({});
    console.log(`\n📊 Found ${users.length} users in MongoDB Atlas:\n`);
    
    users.forEach(user => {
      console.log(`👤 ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   --------------------`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUsers();