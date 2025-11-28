const express = require('express');
const User = require('../models/user');
const { activeSessions, generateSessionId } = require('../middleware/auth');

const router = express.Router();

// Login endpoint - FIXED VERSION
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login request received');
    console.log('Request body:', req.body);

    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    console.log('🔍 Searching for user with username:', username);

    // Find user by username - FIXED: Don't search by password
    const user = await User.findOne({ 
      username: username.toString().trim()
    });

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    console.log('✅ User found:', user.name, '- Role:', user.role, '- Checking password...');

    // Check password - Compare plain text
    if (user.password !== password.toString()) {
      console.log('❌ Invalid password for user:', user.username);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid username or password' 
      });
    }

    console.log('✅ Password correct for user:', user.name);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create session
    const sessionId = generateSessionId();
    activeSessions.set(sessionId, {
      userId: user._id,
      username: user.username,
      role: user.role,
      name: user.name,
      loginTime: new Date()
    });

    // Return user info with session ID
    const userInfo = {
      id: user._id,
      username: user.username,
      role: user.role,
      name: user.name,
      lastLogin: user.lastLogin,
      sessionId: sessionId
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: userInfo
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login: ' + error.message 
    });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const sessionId = req.header('X-Session-ID');
    
    if (sessionId) {
      activeSessions.delete(sessionId);
    }
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Check if users exist
router.get('/check-users', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const users = await User.find({}, 'username role name password');
    
    console.log(`📊 Database has ${userCount} users`);
    
    res.json({ 
      usersExist: userCount > 0,
      userCount,
      users: users 
    });
  } catch (error) {
    console.error('Error checking users:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create initial users - FIXED: Create unique usernames for each role
router.post('/setup-users', async (req, res) => {
  try {
    console.log('🔄 Starting user setup...');

    const users = [
      {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'System Administrator'
      },
      {
        username: 'warehouse', 
        password: 'warehouse123',
        role: 'warehouse_manager',
        name: 'Warehouse Manager'
      },
      {
        username: 'sales',
        password: 'sales123',
        role: 'sales_person',
        name: 'Sales Person'
      },
      {
        username: 'manager',
        password: 'manager123',
        role: 'manager',
        name: 'General Manager'
      }
    ];

    // Clear existing users
    await User.deleteMany({});
    console.log('✅ Cleared existing users');

    // Create new users
    const createdUsers = await User.insertMany(users);
    console.log('✅ Created', createdUsers.length, 'users');

    // Verify users were created
    const userCount = await User.countDocuments();
    const allUsers = await User.find({}, 'username role name password');

    console.log('📋 Created users:');
    allUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.role}): ${user.password}`);
    });

    res.json({ 
      success: true, 
      message: 'Users created successfully in MongoDB Atlas',
      userCount,
      users: allUsers.map(u => ({ 
        username: u.username, 
        role: u.role, 
        name: u.name,
        password: u.password
      }))
    });
  } catch (error) {
    console.error('❌ Setup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error setting up users: ' + error.message 
    });
  }
});

module.exports = router;