require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://habte:1234@ac-0c7cjxp-shard-00-00.h6usazx.mongodb.net:27017,ac-0c7cjxp-shard-00-01.h6usazx.mongodb.net:27017,ac-0c7cjxp-shard-00-02.h6usazx.mongodb.net:27017/yegna?ssl=true&replicaSet=atlas-ujr5vq-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function setupUsers() {
  try {
    console.log('🔄 Setting up users in MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Define User model
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      password: String,
      role: String,
      name: String,
      isActive: Boolean,
      lastLogin: Date
    }, { timestamps: true }));

    // Clear existing users
    await User.deleteMany({});
    console.log('✅ Cleared existing users');

    // Create users with proper roles
    const users = [
      {
        username: 'yegna',
        password: '0521',
        role: 'admin',
        name: 'System Administrator',
        isActive: true
      },
      {
        username: 'yegna',
        password: '0621',
        role: 'warehouse_manager',
        name: 'Warehouse Manager',
        isActive: true
      },
      {
        username: 'yegna',
        password: '0721',
        role: 'sales_person',
        name: 'Sales Person',
        isActive: true
      },
      {
        username: 'yegna',
        password: '0821',
        role: 'manager',
        name: 'General Manager',
        isActive: true
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('✅ Created users:');
    createdUsers.forEach(user => {
      console.log(`   👤 ${user.name}`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Username: ${user.username}`);
      console.log(`      Password: ${user.password}`);
      console.log(`      --------------------`);
    });

    // Verify
    const userCount = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${userCount}`);

  } catch (error) {
    console.error('❌ Setup error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🎉 Setup completed! You can now try to login.');
  }
}

setupUsers();