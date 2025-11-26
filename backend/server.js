const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const salesRoutes = require('./routes/sales');
const purchaseRoutes = require('./routes/purchases');
const factoryRoutes = require('./routes/factoryPurchases');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/sales', salesRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/factory', factoryRoutes);
app.use('/api/auth', authRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// MongoDB Atlas Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://habte:1234@ac-0c7cjxp-shard-00-00.h6usazx.mongodb.net:27017,ac-0c7cjxp-shard-00-01.h6usazx.mongodb.net:27017,ac-0c7cjxp-shard-00-02.h6usazx.mongodb.net:27017/yegna?ssl=true&replicaSet=atlas-ujr5vq-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ Connected to MongoDB Atlas - yegna database');
    
    // Test the connection
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Database contains ${collections.length} collections:`);
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check your internet connection');
    console.log('2. Verify MongoDB Atlas credentials are correct');
    console.log('3. Make sure your IP is whitelisted in MongoDB Atlas');
    console.log('4. Check if the database "yegna" exists in your cluster');
    
    process.exit(1);
  }
};

// Database connection events
mongoose.connection.on('connected', () => {
  console.log('📊 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB Atlas');
});

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
  console.log(`☁️  Connected to MongoDB Atlas Cloud`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  process.exit(0);
});