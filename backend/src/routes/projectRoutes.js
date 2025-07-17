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
const { createMilestoneValidator } = require('../validators/milestoneValidator');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/projects - List user's projects
router.get('/', projectController.getUserProjects);

// GET /api/projects/n/:count - List user's N projects
router.get('/n/:count', projectController.getNUserProjects);

// POST /api/projects - Create new project
router.post('/', createProjectValidator, projectController.createProject);

// GET /api/projects/:id - Get project details
router.get('/:id', projectIdValidator, projectController.getProject);

// PUT /api/projects/:id - Update project
router.put('/:id', projectIdValidator, updateProjectValidator, projectController.updateProject);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', projectIdValidator, projectController.deleteProject);

// POST /api/projects/:id/milestones - Create new milestone
router.post('/:id/milestones', createMilestoneValidator, projectController.createMilestone);

// GET /api/projects/:id/members - Get project members
router.get('/:id/members', projectIdValidator, projectController.getProjectMembers);

// POST /api/projects/:id/members - Add project member
router.post('/:id/members', projectIdValidator, addMemberValidator, projectController.addProjectMember);

// DELETE /api/projects/:id/members/:userId - Remove member
router.delete('/:id/members/:userId', projectIdValidator, projectController.removeProjectMember);

// PATCH /api/projects/:id/members/:userId/:role - Update project member role
router.patch('/:id/members/:userId/:role', projectIdValidator, projectController.removeProjectMember);

// Post /api/projects/:id/access - Check project permission
router.post('/:id/permission', projectIdValidator, projectController.checkProjectPermission);

// POST /api/projects/:id/access - Check project access
router.post('/:id/access', projectIdValidator, projectController.checkProjectAccess);

// PATCH /api/projects/:id/status - Update project status
router.patch('/:id/status', projectIdValidator, projectController.updateProjectStatus);

// DELETE /api/projects/:id/archive - Archive project (soft delete)
router.delete('/:id/archive', projectIdValidator, projectController.archiveProject);

// PATCH /api/projects/:id/restore - Restore archived project
router.patch('/:id/restore', projectIdValidator, projectController.restoreProject);

// GET /api/projects/archived - Get all archived projects
router.get('/archived', projectController.getArchivedProjects);

module.exports = router;