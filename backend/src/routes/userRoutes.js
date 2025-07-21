const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
  createUserValidator,
  updateUserValidator,
  userIdValidator,
  emailValidator,
  skillValidator,
  skillsetValidator
} = require('../validators/userValidator');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/users - List all users
router.get('/', userController.getAllUsers);

// POST /api/users - Create new user
router.post('/', createUserValidator, userController.createUser);

// GET /api/users/search/skills - Search users by skills
router.get('/search/skills', userController.searchUsersBySkills);

// GET /api/users/email/:email - Get user by email (MUST come before /:id route)
router.get('/email/:email', emailValidator, userController.getUserByEmail);

// GET /api/users/skill/:skill - Get users with specific skill
router.get('/skill/:skill', userController.getUsersWithSkill);

// GET /api/users/:id - Get user details (MUST come after specific routes)
router.get('/:id', userIdValidator, userController.getUser);

// PUT /api/users/:id - Update user
router.put('/:id', userIdValidator, updateUserValidator, userController.updateUser);

// DELETE /api/users/:id - Delete user
router.delete('/:id', userIdValidator, userController.deleteUser);

// POST /api/users/:id/skills - Add skill to user
router.post('/:id/skills', userIdValidator, skillValidator, userController.addUserSkill);

// PUT /api/users/:id/skills - Update user skillset
router.put('/:id/skills', userIdValidator, skillsetValidator, userController.updateUserSkillset);

// DELETE /api/users/:id/skills/:skill - Remove skill from user
router.delete('/:id/skills/:skill', userIdValidator, userController.removeUserSkill);

// POST /api/users/:id/profile - Check user profile access
router.post('/:id/profile', userIdValidator, userController.checkProfileAccess);

// POST /api/users/:id/permission - Check user permission
router.post('/:id/permission', userIdValidator, userController.checkUserPermission);

module.exports = router;