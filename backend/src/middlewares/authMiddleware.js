const { verifyIdToken } = require('../config/firebase');

// Middleware to verify Firebase JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is required'
      });
    }

    // Extract token (Bearer <token>)
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Verify the token with Firebase
    const decodedToken = await verifyIdToken(token);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
      firebase: decodedToken
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
      error: error.message
    });
  }
};

// Optional middleware - authenticate if token is provided
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decodedToken = await verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          name: decodedToken.name,
          picture: decodedToken.picture,
          firebase: decodedToken
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Admin role middleware (example of role-based auth)
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Check if user has admin claim (you need to set this custom claim in Firebase)
  if (!req.user.firebase.admin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin
};