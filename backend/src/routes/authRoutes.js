const express = require('express');
const { getUserByUid, createCustomToken } = require('../config/firebase');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { PrismaClient } = require("@prisma/client");
const admin = require('firebase-admin');
const prisma = new PrismaClient();

const router = express.Router();

// This new /sync route replaces the old /register route.
// It's designed to be called on every login/signup.
router.post('/sync', authenticateToken, async (req, res) => {
  try {
    const { uid, email, name } = req.user;

    if (!uid || !email) {
      return res.status(400).json({
        success: false,
        message: 'UID and email are required from the token.',
      });
    }

    // Use `upsert` to create the user if they don't exist, 
    // or update them if they do. This is safe to call multiple times.
    const user = await prisma.user.upsert({
      where: { email: email },
      update: {
        firebaseUid: uid,
        name: name || undefined, // Update name if it exists in token
      },
      create: {
        email: email,
        firebaseUid: uid,
        name: name || 'New User', // Set a default name on creation
      },
    });

    res.json({
      success: true,
      message: 'User synced successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync user',
      error: error.message,
    });
  }
});

// POST /api/auth/register - store unique user on signup by frontend
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const user = await getUserByUid(req.user.uid);
    const email = user.email;
    console.log('Registering user:', email);

    // Ensure required fields are provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'UID and email are required'
      });
    }

    // Check if user already exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user in the database
    const newUser = await prisma.user.create({
      data: {
        email
      }
    });

    res.json({
      success: true,
      message: 'User registered successfully',
      data: {
        email: newUser.email,
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
});


// GET /api/auth/profile - Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await getUserByUid(req.user.uid);
    
    res.json({
      success: true,
      data: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        disabled: user.disabled,
        metadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime
        },
        customClaims: user.customClaims || {}
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
});

// POST /api/auth/verify-token - Verify token endpoint (useful for frontend)
router.post('/verify-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

// POST /api/auth/custom-token - Create custom token (if needed)
router.post('/custom-token', authenticateToken, async (req, res) => {
  try {
    const { claims } = req.body;
    
    const customToken = await createCustomToken(req.user.uid, claims);
    
    res.json({
      success: true,
      customToken: customToken
    });
  } catch (error) {
    console.error('Error creating custom token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom token',
      error: error.message
    });
  }
});

// POST /api/auth/logout - Logout (revoke refresh token)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Revoke all refresh tokens for the user
    await admin.auth().revokeRefreshTokens(req.user.uid);
    
    res.json({
      success: true,
      message: 'Successfully logged out. All refresh tokens revoked.'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to logout',
      error: error.message
    });
  }
});

module.exports = router;