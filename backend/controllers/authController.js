const User = require('../models/user');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-make-it-very-long-and-secure-12345';

// Login controller - SIMPLIFIED VERSION
exports.login = async (req, res) => {
  try {
    console.log('🔐 Login attempt received:', req.body);
    
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Clean the inputs
    const cleanUsername = username.toString().trim();
    const cleanPassword = password.toString();

    console.log('🔍 Searching for user:', cleanUsername);

    // Find user by credentials
    const user = await User.findOne({ 
      username: cleanUsername,
      password: cleanPassword
    });

    if (!user) {
      console.log('❌ User not found or invalid credentials');
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    console.log('✅ User found:', user.name, '- Role:', user.role);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user info with token
    const userInfo = {
      id: user._id,
      username: user.username,
      role: user.role,
      name: user.name,
      lastLogin: user.lastLogin
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: userInfo,
      token: token
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login: ' + error.message
    });
  }
};

// Middleware to verify token
exports.verifyToken = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Role-based access control middleware
exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};