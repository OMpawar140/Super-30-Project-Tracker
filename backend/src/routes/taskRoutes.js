const express = require('express');
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