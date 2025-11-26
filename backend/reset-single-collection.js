const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/rebar-management';

// Single schema definition
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

async function resetSingleCollection() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Drop the single collection
    await mongoose.connection.db.collection('rebar_data').drop();
    console.log('Dropped collection: rebar_data');

    // Recreate default users
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
      console.log(`✅ Created user: ${userData.username}`);
    }

    console.log('✅ Single collection database reset completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
}

resetSingleCollection();