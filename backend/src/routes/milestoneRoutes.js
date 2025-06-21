const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
  createProjectValidator,
  updateProjectValidator,
  addMemberValidator,
  projectIdValidator
} = require('../validators/projectValidator');
const { createTaskValidator } = require('../validators/taskValidator');
const milestoneController = require('../controllers/milestoneController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/projects - List user's projects
router.get('/', projectController.getUserProjects);

// POST /api/projects - Create new project
router.post('/', createProjectValidator, projectController.createProject);

// GET /api/projects/:id - Get project details
router.get('/:id', projectIdValidator, projectController.getProject);

// PUT /api/projects/:id - Update project
router.put('/:id', projectIdValidator, updateProjectValidator, projectController.updateProject);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', projectIdValidator, projectController.deleteProject);

// GET /api/projects/:id/members - Get project members
router.get('/:id/members', projectIdValidator, projectController.getProjectMembers);

// POST /api/milestones/:id/tasks - Add milestone task
router.post('/:id/tasks', createTaskValidator, milestoneController.createTask);

// DELETE /api/projects/:id/members/:userId - Remove member
router.delete('/:id/members/:userId', projectIdValidator, projectController.removeProjectMember);

// Post /api/projects/:id/access - Check project permission
router.post('/:id/permission', projectIdValidator, projectController.checkProjectPermission);

// POST /api/projects/:id/access - Check project access
router.post('/:id/access', projectIdValidator, projectController.checkProjectAccess);

module.exports = router;