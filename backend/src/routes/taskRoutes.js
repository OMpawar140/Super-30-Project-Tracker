const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { body, param, query } = require('express-validator');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Validation middleware
const validateTaskId = [
  param('id')
    .notEmpty()
    .withMessage('Task ID is required')
    .isString()
    .withMessage('Task ID must be a string')
    .isLength({ min: 1 })
    .withMessage('Task ID cannot be empty')
];

const validateMilestoneId = [
  param('milestoneId')
    .notEmpty()
    .withMessage('Milestone ID is required')
    .isString()
    .withMessage('Milestone ID must be a string')
    .isLength({ min: 1 })
    .withMessage('Milestone ID cannot be empty')
];

const validateProjectId = [
  param('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isString()
    .withMessage('Project ID must be a string')
    .isLength({ min: 1 })
    .withMessage('Project ID cannot be empty')
];

const validateCreateTask = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid priority'),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED']).withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
  body('assignedTo').optional().isString().withMessage('Assigned user must be a string'),
  body('estimatedHours').optional().isNumeric().withMessage('Estimated hours must be numeric'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
];

const validateUpdateTask = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid priority'),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED']).withMessage('Invalid status'),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
  body('assignedTo').optional().isString().withMessage('Assigned user must be a string'),
  body('estimatedHours').optional().isNumeric().withMessage('Estimated hours must be numeric'),
  body('actualHours').optional().isNumeric().withMessage('Actual hours must be numeric'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
];

const validateStatus = [
  body('status').isIn(['UPCOMING', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED', 'OVERDUE']).withMessage('Invalid status')
];

const validateAssignTask = [
  body('userId').notEmpty().withMessage('User ID is required')
];

const validatePriority = [
  body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid priority')
];

const validateComment = [
  body('comment').notEmpty().withMessage('Comment is required')
];

const validateDueDate = [
  body('dueDate').isISO8601().withMessage('Invalid due date format')
];

const validateReorderTasks = [
  body('taskIds').isArray().withMessage('Task IDs must be an array'),
  body('taskIds.*').isUUID().withMessage('Each task ID must be a valid UUID')
];

const validateMoveTask = [
  body('milestoneId').isUUID().withMessage('Invalid milestone ID format')
];

const validateBulkUpdate = [
  body('updates').isArray().withMessage('Updates must be an array'),
  body('updates.*.taskId').isUUID().withMessage('Each task ID must be a valid UUID'),
  body('updates.*.updates').isObject().withMessage('Updates must be an object')
];

const validateStatusQuery = [
  query('status').isIn(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED']).withMessage('Invalid status')
];

// Task routes

// GET /api/milestones/:milestoneId/tasks - Get all tasks for a milestone
router.get('/milestones/:milestoneId/tasks', 
  validateMilestoneId, 
  taskController.getMilestoneTasks
);

// GET /api/projects/:projectId/tasks - Get all tasks for a project
router.get('/projects/:projectId/tasks', 
  validateProjectId, 
  taskController.getProjectTasks
);

// GET /api/tasks/:id - Get task by ID
router.get('/:id', 
  validateTaskId, 
  taskController.getTaskById
);

// POST /api/milestones/:milestoneId/tasks - Create new task
router.post('/milestones/:milestoneId/tasks', 
  validateMilestoneId,
  validateCreateTask, 
  taskController.createTask
);

// PUT /api/tasks/:id - Update existing task
router.put('/:id', 
  validateTaskId,
  validateUpdateTask, 
  taskController.updateTask
);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', 
  validateTaskId, 
  taskController.deleteTask
);

// POST /api/tasks/:id/review - Submit review
router.post('/:id/review',
  validateTaskId,
  taskController.submitReview
);

// PATCH /api/tasks/:id/status - Update task status
router.patch('/:id/status', 
  validateTaskId,
  validateStatus, 
  taskController.updateTaskStatus
);

// PATCH /api/tasks/:id/assign - Assign task to user
router.patch('/:id/assign', 
  validateTaskId,
  validateAssignTask, 
  taskController.assignTask
);

// PATCH /api/tasks/:id/unassign - Unassign task
router.patch('/:id/unassign', 
  validateTaskId, 
  taskController.unassignTask
);

// PATCH /api/tasks/:id/priority - Update task priority
router.patch('/:id/priority', 
  validateTaskId,
  validatePriority, 
  taskController.updateTaskPriority
);

// POST /api/tasks/:id/comments - Add comment to task
router.post('/:id/comments', 
  validateTaskId,
  validateComment, 
  taskController.addTaskComment
);

// GET /api/tasks/:id/comments - Get task comments
router.get('/:id/comments', 
  validateTaskId, 
  taskController.getTaskComments
);

// PATCH /api/tasks/:id/due-date - Update task due date
router.patch('/:id/due-date', 
  validateTaskId,
  validateDueDate, 
  taskController.updateTaskDueDate
);

// GET /api/tasks/assigned-to-me - Get tasks assigned to current user
router.get('/assigned-to-me', 
  taskController.getMyTasks
);

// GET /api/tasks?status=:status - Get tasks by status
router.get('', 
  validateStatusQuery, 
  taskController.getTasksByStatus
);

// GET /api/tasks/overdue - Get overdue tasks
router.get('/overdue', 
  taskController.getOverdueTasks
);

// PUT /api/milestones/:milestoneId/tasks/reorder - Reorder tasks within a milestone
router.put('/milestones/:milestoneId/tasks/reorder', 
  validateMilestoneId,
  validateReorderTasks, 
  taskController.reorderTasks
);

// PATCH /api/tasks/:id/move - Move task to different milestone
router.patch('/:id/move', 
  validateTaskId,
  validateMoveTask, 
  taskController.moveTask
);

// PUT /api/tasks/bulk - Bulk update tasks
router.put('/bulk', 
  validateBulkUpdate, 
  taskController.bulkUpdateTasks
);

module.exports = router;const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator,
} = require('../validators/taskValidator');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/tasks - List user's tasks
// router.get('/', taskController.getUserTasks);

// POST /api/tasks - Create new task
router.post('/', createTaskValidator, taskController.createTask);

// GET /api/tasks/:id - Get task details
router.get('/:id', taskIdValidator, taskController.getTask);

// PUT /api/tasks/:id - Update task
router.put('/:id', taskIdValidator, updateTaskValidator, taskController.updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', taskIdValidator, taskController.deleteTask);

// PUT /api/tasks/:id/status - Update task status
// router.put('/:id/status', taskIdValidator, taskController.updateTaskStatus);

// PUT /api/tasks/:id/priority - Update task priority
router.put('/:id/priority', taskIdValidator, taskController.updateTaskPriority);

// DELETE /api/tasks/:id/assign - Unassign task
// router.delete('/:id/assign', taskIdValidator, taskController.unassignTask);

// GET /api/tasks/:id/comments - Get task comments
// router.get('/:id/comments', taskIdValidator, taskController.getTaskComments);

// POST /api/tasks/:id/comments - Add task comment
// router.post('/:id/comments', taskIdValidator, taskController.addTaskComment);

// PUT /api/tasks/:id/comments/:commentId - Update task comment
// router.put('/:id/comments/:commentId', taskIdValidator, taskController.updateTaskComment);

// DELETE /api/tasks/:id/comments/:commentId - Delete task comment
// router.delete('/:id/comments/:commentId', taskIdValidator, taskController.deleteTaskComment);

// GET /api/tasks/project/:projectId - Get tasks by project
// router.get('/project/:projectId', taskController.getTasksByProject);

// GET /api/tasks/milestone/:milestoneId - Get tasks by milestone
// router.get('/milestone/:milestoneId', taskController.getTasksByMilestone);

// GET /api/tasks/assigned/:userId - Get tasks assigned to user
// router.get('/assigned/:userId', taskController.getTasksAssignedToUser);

// GET /api/tasks/status/:status - Get tasks by status
router.get('/status/:status', taskController.getTasksByStatus);

// GET /api/tasks/priority/:priority - Get tasks by priority
router.get('/priority/:priority', taskController.getTasksByPriority);

// GET /api/tasks/overdue - Get overdue tasks
router.get('/overdue', taskController.getOverdueTasks);

// GET /api/tasks/upcoming - Get upcoming tasks (due soon)
router.get('/upcoming', taskController.getUpcomingTasks);


// PUT /api/tasks/:id/move - Move task to different milestone/project
router.put('/:id/move', taskIdValidator, taskController.moveTask);


module.exports = router;