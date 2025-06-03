const express = require('express');
const { authenticateToken, optionalAuth, requireAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Example: Public route (no authentication required)
router.get('/public', (req, res) => {
  res.json({
    success: true,
    message: 'This is a public endpoint',
    timestamp: new Date().toISOString()
  });
});

// Example: Protected route (authentication required)
router.get('/dashboard', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: `Welcome to your dashboard, ${req.user.name || req.user.email}!`,
    user: {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name
    },
    timestamp: new Date().toISOString()
  });
});

// Example: Optional authentication route
router.get('/feed', optionalAuth, (req, res) => {
  const response = {
    success: true,
    message: 'Here is your feed',
    timestamp: new Date().toISOString()
  };

  if (req.user) {
    response.personalizedFor = req.user.email;
    response.message = `Personalized feed for ${req.user.name || req.user.email}`;
  } else {
    response.message = 'Public feed (login for personalized content)';
  }

  res.json(response);
});

// Example: Admin only route
router.get('/admin/users', authenticateToken, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted',
    data: {
      totalUsers: 1234,
      activeUsers: 456,
      adminUser: req.user.email
    }
  });
});

// Example: User data management
router.get('/user/settings', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'User settings retrieved',
    settings: {
      notifications: true,
      theme: 'dark',
      language: 'en',
      lastLogin: new Date().toISOString()
    },
    user: {
      uid: req.user.uid,
      email: req.user.email
    }
  });
});

router.put('/user/settings', authenticateToken, (req, res) => {
  const { notifications, theme, language } = req.body;
  
  // Here you would typically save to your database
  // For example: await UserSettings.updateOne({ uid: req.user.uid }, { notifications, theme, language });
  
  res.json({
    success: true,
    message: 'Settings updated successfully',
    updatedSettings: {
      notifications,
      theme,
      language,
      updatedAt: new Date().toISOString()
    }
  });
});

module.exports = router;