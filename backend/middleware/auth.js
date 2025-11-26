// Simple session storage (in production, use Redis or database)
const activeSessions = new Map();

// Generate simple session ID
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Verify session middleware
const verifySession = (req, res, next) => {
  try {
    const sessionId = req.header('X-Session-ID') || req.query.sessionId;
    
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: 'No session provided'
      });
    }

    const session = activeSessions.get(sessionId);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    // Add user info to request
    req.user = session;
    req.sessionId = sessionId;
    next();
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Session verification failed'
    });
  }
};

// Role-based access control middleware
const authorize = (roles = []) => {
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

module.exports = {
  verifySession,
  authorize,
  activeSessions,
  generateSessionId
};