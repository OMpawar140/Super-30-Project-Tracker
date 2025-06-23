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

  // Create new task
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

  // Update existing task
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

  // Unassign task
  async unassignTask(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      const task = await taskService.unassignTask(id, userEmail);
      
      if (!task) {
        return errorResponse(res, 'Task not found or access denied', 404);
      }

      return successResponse(res, 'Task unassigned successfully', task);
    } catch (error) {
      console.error('Error unassigning task:', error);
      return errorResponse(res, 'Failed to unassign task', 500);
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
      
      if (!task) {
        return errorResponse(res, 'Task not found or access denied', 404);
      }

      return successResponse(res, 'Task priority updated successfully', task);
    } catch (error) {
      console.error('Error updating task priority:', error);
      return errorResponse(res, 'Failed to update task priority', 500);
    }
  }

  // Add comment to task
  async addTaskComment(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const { comment } = req.body;
      const userEmail = req.user.email;

      const taskComment = await taskService.addTaskComment(id, userEmail, comment);
      
      if (!taskComment) {
        return errorResponse(res, 'Task not found or access denied', 404);
      }

      return successResponse(res, 'Comment added successfully', taskComment, 201);
    } catch (error) {
      console.error('Error adding task comment:', error);
      return errorResponse(res, 'Failed to add comment', 500);
    }
  }

  // Get task comments
  async getTaskComments(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      const comments = await taskService.getTaskComments(id, userEmail);
      
      if (comments === null) {
        return errorResponse(res, 'Task not found or access denied', 404);
      }

      return successResponse(res, 'Task comments retrieved successfully', comments);
    } catch (error) {
      console.error('Error getting task comments:', error);
      return errorResponse(res, 'Failed to retrieve task comments', 500);
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

  // Get tasks assigned to current user
  async getMyTasks(req, res) {
    try {
      const userEmail = req.user.email;
      const { projectId } = req.query;
      
      console.log('Getting tasks assigned to user:', userEmail);
      const tasks = await taskService.getMyTasks(userEmail, projectId);
      
      return successResponse(res, 'Assigned tasks retrieved successfully', tasks);
    } catch (error) {
      console.error('Error getting assigned tasks:', error);
      return errorResponse(res, 'Failed to retrieve assigned tasks', 500);
    }
  }

  // Get tasks by status
  async getTasksByStatus(req, res) {
    try {
      const { status } = req.query;
      const { projectId } = req.query;
      const userEmail = req.user.email;

      if (!status) {
        return errorResponse(res, 'Status parameter is required', 400);
      }

      console.log('Getting tasks by status:', status, 'for project:', projectId, 'by user:', userEmail);
      const tasks = await taskService.getTasksByStatus(userEmail, status, projectId);
      
      return successResponse(res, 'Tasks retrieved successfully', tasks);
    } catch (error) {
      console.error('Error getting tasks by status:', error);
      return errorResponse(res, 'Failed to retrieve tasks by status', 500);
    }
  }

  // Get overdue tasks
  async getOverdueTasks(req, res) {
    try {
      const { projectId } = req.query;
      const userEmail = req.user.email;
      
      console.log('Getting overdue tasks for project:', projectId, 'by user:', userEmail);
      const tasks = await taskService.getOverdueTasks(userEmail, projectId);
      
      return successResponse(res, 'Overdue tasks retrieved successfully', tasks);
    } catch (error) {
      console.error('Error getting overdue tasks:', error);
      return errorResponse(res, 'Failed to retrieve overdue tasks', 500);
    }
  }

  // Reorder tasks within a milestone
  async reorderTasks(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { milestoneId } = req.params;
      const { taskIds } = req.body;
      const userEmail = req.user.email;

      if (!Array.isArray(taskIds)) {
        return errorResponse(res, 'taskIds must be an array', 400);
      }

      const result = await taskService.reorderTasks(milestoneId, userEmail, taskIds);
      
      if (!result) {
        return errorResponse(res, 'Milestone not found or access denied', 404);
      }

      return successResponse(res, 'Tasks reordered successfully', result);
    } catch (error) {
      console.error('Error reordering tasks:', error);
      return errorResponse(res, 'Failed to reorder tasks', 500);
    }
  }

  // Move task to different milestone
  async moveTask(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const { milestoneId } = req.body;
      const userEmail = req.user.email;

      const task = await taskService.moveTask(id, userEmail, milestoneId);
      
      if (!task) {
        return errorResponse(res, 'Task or milestone not found, or access denied', 404);
      }

      return successResponse(res, 'Task moved successfully', task);
    } catch (error) {
      console.error('Error moving task:', error);
      return errorResponse(res, 'Failed to move task', 500);
    }
  }

  // Bulk update tasks
  async bulkUpdateTasks(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { updates } = req.body;
      const userEmail = req.user.email;

      if (!Array.isArray(updates)) {
        return errorResponse(res, 'updates must be an array', 400);
      }

      console.log('Bulk updating tasks:', updates.length, 'tasks by user:', userEmail);
      const results = await taskService.bulkUpdateTasks(userEmail, updates);
      
      return successResponse(res, 'Bulk update completed', results);
    } catch (error) {
      console.error('Error bulk updating tasks:', error);
      return errorResponse(res, 'Failed to bulk update tasks', 500);
    }
  }
}

module.exports = new TaskController();