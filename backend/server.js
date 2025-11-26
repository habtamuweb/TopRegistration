const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const weRoutes = require('./routes/we');
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
app.use('/api/we', weRoutes);
app.use('/api/auth', authRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Unified API is working! All data stored in single collection.' });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    collection: 'we'
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
    console.log('📁 Using unified collection: we');
    
  } catch (error) {
    console.error('❌ MongoDB Atlas connection error:', error.message);
    process.exit(1);
  }
};

// Database connection events
mongoose.connection.on('connected', () => {
  console.log('📊 Mongoose connected to MongoDB Atlas - Collection: we');
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
  console.log(`🚀 Unified Server running on port ${PORT}`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📊 Unified API: http://localhost:${PORT}/api/we`);
  console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
  console.log(`☁️  Connected to MongoDB Atlas Cloud - Single Collection: we`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  process.exit(0);
});