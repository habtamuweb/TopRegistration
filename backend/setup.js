require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

async function setupAtlasUsers() {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB Atlas');

    // Define user schema
    const userSchema = new mongoose.Schema({
      username: String,
      password: String,
      role: String,
      name: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    const User = mongoose.model('User', userSchema);

    // Clear existing users
    await User.deleteMany({});
    console.log('✅ Cleared existing users');

    // Create users
    const users = [
      {
        username: 'yegna',
        password: '0521',
        role: 'admin',
        name: 'System Administrator'
      },
      {
        username: 'yegna', 
        password: '0621',
        role: 'warehouse_manager',
        name: 'Warehouse Manager'
      },
      {
        username: 'yegna',
        password: '0721',
        role: 'sales_person',
        name: 'Sales Person'
      },
      {
        username: 'yegna',
        password: '0821',
        role: 'manager',
        name: 'General Manager'
      }
    ];

    await User.insertMany(users);
    console.log('✅ Users created successfully in MongoDB Atlas!');
    
    // Display created users
    console.log('\n👥 Created Users:');
    users.forEach(user => {
      console.log(`   📝 ${user.name} - Username: ${user.username} / Password: ${user.password} - Role: ${user.role}`);
    });

    console.log('\n🎉 Setup completed! Database: MongoDB Atlas');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Please check:');
    console.log('1. Your internet connection');
    console.log('2. MongoDB Atlas credentials in .env file');
    console.log('3. IP whitelist in MongoDB Atlas dashboard');
  } finally {
    mongoose.connection.close();
  }
}

setupAtlasUsers();