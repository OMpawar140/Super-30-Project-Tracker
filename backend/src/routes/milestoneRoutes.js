const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
  createProjectValidator,
  updateProjectValidator,
  addMemberValidator,
  projectIdValidator,
} = require('../validators/projectValidator');
const { createTaskValidator } = require('../validators/taskValidator');
const milestoneController = require('../controllers/milestoneController');
const { createMilestoneValidator, updateMilestoneValidator, milestoneIdValidator } = require('../validators/milestoneValidator');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/projects - List user's projects
router.get('/', projectController.getUserProjects);

// POST /api/projects - Create new project
router.post('/', createProjectValidator, projectController.createProject);

// GET /api/projects/:id - Get project details
router.get('/:id', projectIdValidator, projectController.getProject);

// PUT /api/projects/:id - Update project
router.put('/:id', milestoneIdValidator, updateMilestoneValidator, milestoneController.updateMilestone);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', projectIdValidator, projectController.deleteProject);

// GET /api/projects/:id/members - Get project members
router.get('/:id/members', projectIdValidator, projectController.getProjectMembers);

// POST /api/projects/:id/members - Add project member
router.post('/:id/members', projectIdValidator, addMemberValidator, projectController.addProjectMember);

// DELETE /api/projects/:id/members/:userId - Remove member
router.delete('/:id/members/:userId', projectIdValidator, projectController.removeProjectMember);

// MILESTONE ROUTES
// POST /api/projects/:projectId/milestones - Create milestone for project
router.post('/:projectId/milestones', projectIdValidator, createMilestoneValidator, milestoneController.createMilestone);

// GET /api/projects/:projectId/milestones - Get all milestones for project
router.get('/:projectId/milestones', projectIdValidator, milestoneController.getProjectMilestones);

// GET /api/projects/:projectId/milestones/status - Get milestones by status
router.get('/:projectId/milestones/status', projectIdValidator, milestoneController.getMilestonesByStatus);

// GET /api/projects/:projectId/milestones/upcoming - Get upcoming milestones
router.get('/:projectId/milestones/upcoming', projectIdValidator, milestoneController.getUpcomingMilestones);

// GET /api/projects/:projectId/milestones/overdue - Get overdue milestones
router.get('/:projectId/milestones/overdue', projectIdValidator, milestoneController.getOverdueMilestones);

// GET /api/projects/:projectId/milestones/stats - Get milestone statistics
router.get('/:projectId/milestones/stats', projectIdValidator, milestoneController.getMilestoneStats);

// PUT /api/projects/:projectId/milestones/bulk-status - Bulk update milestone status
router.put('/:projectId/milestones/bulk-status', projectIdValidator, milestoneController.bulkUpdateMilestoneStatus);

// GET /api/milestones/:id - Get milestone by ID
router.get('/milestones/:id', milestoneIdValidator, milestoneController.getMilestone);

// PUT /api/milestones/:id - Update milestone
router.put('/milestones/:id', milestoneIdValidator, updateMilestoneValidator, milestoneController.updateMilestone);

// DELETE /api/milestones/:id - Delete milestone
router.delete('/milestones/:id', milestoneIdValidator, milestoneController.deleteMilestone);

// POST /api/milestones/:id/tasks - Add milestone task
router.post('/milestones/:id/tasks', milestoneIdValidator, createTaskValidator, milestoneController.createTask);

// POST /api/projects/:id/permission - Check project permission
router.post('/:id/permission', projectIdValidator, projectController.checkProjectPermission);

// POST /api/projects/:id/access - Check project access
router.post('/:id/access', projectIdValidator, projectController.checkProjectAccess);

module.exports = router;