const taskService = require('../services/taskService');
const { successResponse, errorResponse } = require('../utils/response');
const { validationResult } = require('express-validator');

class TaskController {

  // Get all tasks for a milestone
  async getMilestoneTasks(req, res) {
    try {
      const { milestoneId } = req.params;
      const userEmail = req.user.email;
      
      console.log('Getting tasks for milestone:', milestoneId, 'by user:', userEmail);
      const tasks = await taskService.getMilestoneTasks(milestoneId, userEmail);
      
      if (tasks === null) {
        return errorResponse(res, 'Milestone not found or access denied', 404);
      }
      
      return successResponse(res, 'Milestone tasks retrieved successfully', tasks);
    } catch (error) {
      console.error('Error getting milestone tasks:', error);
      return errorResponse(res, 'Failed to retrieve milestone tasks', 500);
    }
  }

  // Get all tasks for a project
  async getProjectTasks(req, res) {
    try {
      const { projectId } = req.params;
      const userEmail = req.user.email;
      
      console.log('Getting tasks for project:', projectId, 'by user:', userEmail);
      const tasks = await taskService.getProjectTasks(projectId, userEmail);
      
      if (tasks === null) {
        return errorResponse(res, 'Project not found or access denied', 404);
      }
      
      return successResponse(res, 'Project tasks retrieved successfully', tasks);
    } catch (error) {
      console.error('Error getting project tasks:', error);
      return errorResponse(res, 'Failed to retrieve project tasks', 500);
    }
  }

  // Get task by ID
  async getTaskById(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      const task = await taskService.getTaskById(id, userEmail);
      
      if (!task) {
        return errorResponse(res, 'Task not found or access denied', 404);
      }

      return successResponse(res, 'Task retrieved successfully', task);
    } catch (error) {
      console.error('Error getting task:', error);
      return errorResponse(res, 'Failed to retrieve task', 500);
    }
  }

  // Create a new task for a milestone
  async createTask(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { milestoneId } = req.params;
      const userEmail = req.user.email;
      const taskData = {
        ...req.body,
        milestoneId,
        createdBy: userEmail
      };

      console.log('Creating task for milestone:', milestoneId, 'by user:', userEmail);

      const task = await taskService.createTask(milestoneId, userEmail, taskData);
      
      if (!task) {
        return errorResponse(res, 'Milestone not found or access denied', 404);
      }

      return successResponse(res, 'Task created successfully', task, 201);
    } catch (error) {
      console.error('Error creating task:', error);
      return errorResponse(res, 'Failed to create task', 500);
    }
  }
  
  // Get task by ID
  async getTask(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      console.log('Getting task:', id, 'for user:', userEmail);

      const task = await taskService.getTaskById(id, userEmail);
      
      if (!task) {
        return errorResponse(res, 'Task not found or access denied', 404);
      }

      return successResponse(res, 'Task retrieved successfully', task);
    } catch (error) {
      console.error('Error getting task:', error);
      return errorResponse(res, 'Failed to retrieve task', 500);
    }
  }

  // Get tasks assigned to the current user
  async getMyTasks(req, res) {
    try {
      const { projectId } = req.query;
      const userEmail = req.user.email;

      console.log('Getting assigned tasks for user:', userEmail, 'project:', projectId);
      const tasks = await taskService.getAssignedTasks(userEmail, projectId || null);

      return successResponse(res, 'Assigned tasks retrieved successfully', tasks);
    } catch (error) {
      console.error('Error getting assigned tasks:', error);
      return errorResponse(res, 'Failed to retrieve assigned tasks', 500);
    }
  }

  // Update task
  async updateTask(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const userEmail = req.user.email;
      const updateData = req.body;

      console.log('Updating task:', id, 'by user:', userEmail);

      const task = await taskService.updateTask(id, userEmail, updateData);
      
      if (!task) {
        return errorResponse(res, 'Task not found or access denied', 404);
      }

      return successResponse(res, 'Task updated successfully', task);
    } catch (error) {
      console.error('Error updating task:', error);
      return errorResponse(res, 'Failed to update task', 500);
    }
  }

  // Delete task
  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      console.log('Deleting task:', id, 'by user:', userEmail);

      const deleted = await taskService.deleteTask(id, userEmail);
      
      if (!deleted) {
        return errorResponse(res, 'Task not found or access denied', 404);
      }

      return successResponse(res, 'Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      return errorResponse(res, 'Failed to delete task', 500);
    }
  }

  // Submit Task Review
  async submitReview(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const userEmail = req.user.email;
      const reviewData = {
        ...req.body,
        reviewerId: userEmail
      };

      const task = await taskService.submitTaskReview(id, userEmail, reviewData);
      
      if (!task) {
        return errorResponse(res, 'Task not found or access denied', 404);
      }

      return successResponse(res, 'Task status updated successfully', task);
    } catch (error) {
      console.error('Error updating task status:', error);
      return errorResponse(res, 'Failed to update task status', 500);
    }
  }

  // Update task status
  async updateTaskStatus(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const { status } = req.body;
      const userEmail = req.user.email;

      const task = await taskService.updateTaskStatus(id, userEmail, status);
      
      if (!task) {
        return errorResponse(res, 'Task not found or access denied', 404);
      }

      return successResponse(res, 'Task status updated successfully', task);
    } catch (error) {
      console.error('Error updating task status:', error);
      return errorResponse(res, 'Failed to update task status', 500);
    }
  }
  // Get tasks by status for a milestone
  async getTasksByStatus(req, res) {
    try {
      const { milestoneId } = req.params;
      const { status } = req.query;
      const userEmail = req.user.email;

      if (!status) {
        return errorResponse(res, 'Status parameter is required', 400);
      }

      console.log('Getting tasks by status:', status, 'for milestone:', milestoneId, 'for user:', userEmail);
      const tasks = await taskService.getTasksByStatus(milestoneId, userEmail, status);
      
      if (tasks === null) {
        return errorResponse(res, 'Milestone not found or access denied', 404);
      }

      return successResponse(res, `Tasks with status '${status}' retrieved successfully`, tasks);
    } catch (error) {
      console.error('Error getting tasks by status:', error);
      return errorResponse(res, 'Failed to retrieve tasks by status', 500);
    }
  }

  // Get tasks by priority for a milestone
  async getTasksByPriority(req, res) {
    try {
      const { milestoneId } = req.params;
      const { priority } = req.query;
      const userEmail = req.user.email;

      if (!priority) {
        return errorResponse(res, 'Priority parameter is required', 400);
      }

      console.log('Getting tasks by priority:', priority, 'for milestone:', milestoneId, 'for user:', userEmail);

      const tasks = await taskService.getTasksByPriority(milestoneId, userEmail, priority);
      
      if (tasks === null) {
        return errorResponse(res, 'Milestone not found or access denied', 404);
      }

      return successResponse(res, `Tasks with priority '${priority}' retrieved successfully`, tasks);
    } catch (error) {
      console.error('Error getting tasks by priority:', error);
      return errorResponse(res, 'Failed to retrieve tasks by priority', 500);
    }
  }

  // Get overdue tasks for a milestone
  async getOverdueTasks(req, res) {
    try {
      const { milestoneId } = req.params;
      const userEmail = req.user.email;

      console.log('Getting overdue tasks for milestone:', milestoneId, 'for user:', userEmail);
      const tasks = await taskService.getOverdueTasks(milestoneId, userEmail);
      
      if (tasks === null) {
        return errorResponse(res, 'Milestone not found or access denied', 404);
      }

      return successResponse(res, 'Overdue tasks retrieved successfully', tasks);
    } catch (error) {
      console.error('Error getting overdue tasks:', error);
      return errorResponse(res, 'Failed to retrieve overdue tasks', 500);
    }
  }

  // Get upcoming tasks for the current user
  async getUpcomingTasks(req, res) {
    try {
      const { days = 7 } = req.query;
      const userEmail = req.user.email;

      console.log('Getting upcoming tasks for user:', userEmail, 'within days:', days);

      const tasks = await taskService.getUpcomingTasks(userEmail, parseInt(days));

      return successResponse(res, 'Upcoming tasks retrieved successfully', tasks);
    } catch (error) {
      console.error('Error getting upcoming tasks:', error);
      return errorResponse(res, 'Failed to retrieve upcoming tasks', 500);
    }
  }

  // Assign task to user
  async assignTask(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const { userId } = req.body;
      const userEmail = req.user.email;

      const task = await taskService.assignTask(id, userEmail, userId);
      const { assigneeId } = req.body;

      if (!assigneeId) {
        return errorResponse(res, 'Assignee ID is required', 400);
      }

      console.log('Assigning task:', id, 'to user:', assigneeId, 'by user:', userEmail);
      
      if (!task) {
        return errorResponse(res, 'Task not found or access denied', 404);
      }

      return successResponse(res, 'Task assigned successfully', task);
    } catch (error) {
      console.error('Error assigning task:', error);
      if (error.message === 'User not found' || error.message === 'User not a project member') {
        return errorResponse(res, error.message, 404);
      }
      return errorResponse(res, 'Failed to assign task', 500);
    }
  }

  // Complete task
  async completeTask(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      const task = await taskService.unassignTask(id, userEmail);
      console.log('Completing task:', id, 'by user:', userEmail);
      
      if (!task) {
        return errorResponse(res, 'Task not found or access denied', 404);
      }

      return successResponse(res, 'Task completed successfully', task);
    } catch (error) {
      console.error('Error completing task:', error);
      return errorResponse(res, 'Failed to complete task', 500);
    }
  }

  // Get task statistics for a milestone
  async getTaskStats(req, res) {
    try {
      const { milestoneId } = req.params;
      const userEmail = req.user.email;

      console.log('Getting task statistics for milestone:', milestoneId, 'for user:', userEmail);

      // Check if user has permission to view milestone tasks
      const hasPermission = await taskService.checkMilestonePermission(milestoneId, userEmail, ['CREATOR', 'ADMIN', 'MEMBER']);
      if (!hasPermission) {
        return errorResponse(res, 'Milestone not found or access denied', 404);
      }

      // Get task statistics
      const stats = await taskService.getTaskStats(milestoneId, userEmail);
      
      if (stats === null) {
        return errorResponse(res, 'Failed to retrieve task statistics', 500);
      }

      return successResponse(res, 'Task statistics retrieved successfully', stats);
    } catch (error) {
      console.error('Error getting task statistics:', error);
      return errorResponse(res, 'Failed to retrieve task statistics', 500);
    }
  }

  // Get user's task dashboard (summary of tasks across all projects)
  async getTaskDashboard(req, res) {
    try {
      const userEmail = req.user.email;

      console.log('Getting task dashboard for user:', userEmail);

      // Get various task categories
      const [assignedTasks, upcomingTasks, overdueTasks] = await Promise.all([
        taskService.getAssignedTasks(userEmail),
        taskService.getUpcomingTasks(userEmail, 7),
        // You'll need to add a method for user's overdue tasks across all projects
        taskService.getUserOverdueTasks ? taskService.getUserOverdueTasks(userEmail) : []
      ]);

      const dashboard = {
        totalAssigned: assignedTasks.length,
        upcoming: upcomingTasks.length,
        overdue: overdueTasks.length,
        completed: assignedTasks.filter(task => task.status === 'COMPLETED').length,
        inProgress: assignedTasks.filter(task => task.status === 'IN_PROGRESS').length,
        tasks: {
          assigned: assignedTasks,
          upcoming: upcomingTasks,
          overdue: overdueTasks
        }
      };

      return successResponse(res, 'Task dashboard retrieved successfully', dashboard);
    } catch (error) {
      console.error('Error getting task dashboard:', error);
      return errorResponse(res, 'Failed to retrieve task dashboard', 500);
    }
  }

  // Update task priority
  async updateTaskPriority(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const { priority } = req.body;
      const userEmail = req.user.email;

      const task = await taskService.updateTaskPriority(id, userEmail, priority);
      if (!priority) {
        return errorResponse(res, 'Priority is required', 400);
      }

      console.log('Updating task priority:', id, 'to:', priority, 'by user:', userEmail);
      
      if (!task) {
        return errorResponse(res, 'Task not found or access denied', 404);
      }

      return successResponse(res, 'Task priority updated successfully', task);
    } catch (error) {
      console.error('Error updating task priority:', error);
      return errorResponse(res, 'Failed to update task priority', 500);
    }
  }

  // Update task due date
  async updateTaskDueDate(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const { dueDate } = req.body;
      const userEmail = req.user.email;

      const task = await taskService.updateTaskDueDate(id, userEmail, dueDate);
      
      if (!task) {
        return errorResponse(res, 'Task not found or access denied', 404);
      }

      return successResponse(res, 'Task due date updated successfully', task);
    } catch (error) {
      console.error('Error updating task due date:', error);
      return errorResponse(res, 'Failed to update task due date', 500);
    }
  }
}

module.exports = new TaskController();