const projectService = require('../services/projectService');
const milestoneService = require('../services/milestoneService');
const { successResponse, errorResponse } = require('../utils/response');
const { validationResult } = require('express-validator');
const emailService = require('../services/emailService');

class MilestoneController {
  // Create a new milestone for a project
  async createMilestone(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { projectId } = req.params;
      const userEmail = req.user.email;
      const milestoneData = req.body;

      console.log('Creating milestone for project:', projectId, 'by user:', userEmail);

      const milestone = await milestoneService.createMilestone(projectId, userEmail, milestoneData);
      
      if (!milestone) {
        return errorResponse(res, 'Project not found or access denied', 404);
      }

      return successResponse(res, 'Milestone created successfully', milestone, 201);
    } catch (error) {
      console.error('Error creating milestone:', error);
      return errorResponse(res, 'Failed to create milestone', 500);
    }
  }

  // Get milestone by ID
  async getMilestone(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      console.log('Getting milestone:', id, 'for user:', userEmail);

      const milestone = await milestoneService.getMilestoneById(id, userEmail);
      
      if (!milestone) {
        return errorResponse(res, 'Milestone not found or access denied', 404);
      }

      return successResponse(res, 'Milestone retrieved successfully', milestone);
    } catch (error) {
      console.error('Error getting milestone:', error);
      return errorResponse(res, 'Failed to retrieve milestone', 500);
    }
  }

  // Get all milestones for a project
  async getProjectMilestones(req, res) {
    try {
      const { projectId } = req.params;
      const userEmail = req.user.email;

      console.log('Getting milestones for project:', projectId, 'for user:', userEmail);

      const milestones = await milestoneService.getProjectMilestones(projectId, userEmail);
      
      if (milestones === null) {
        return errorResponse(res, 'Project not found or access denied', 404);
      }

      return successResponse(res, 'Project milestones retrieved successfully', milestones);
    } catch (error) {
      console.error('Error getting project milestones:', error);
      return errorResponse(res, 'Failed to retrieve project milestones', 500);
    }
  }

  // Update milestone
  async updateMilestone(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const userEmail = req.user.email;
      const updateData = req.body;

      console.log('Updating milestone:', id, 'by user:', userEmail);

      const milestone = await milestoneService.updateMilestone(id, userEmail, updateData);
      
      if (!milestone) {
        return errorResponse(res, 'Milestone not found or access denied', 404);
      }

      return successResponse(res, 'Milestone updated successfully', milestone);
    } catch (error) {
      console.error('Error updating milestone:', error);
      return errorResponse(res, 'Failed to update milestone', 500);
    }
  }

  // Delete milestone
  async deleteMilestone(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      console.log('Deleting milestone:', id, 'by user:', userEmail);

      const deleted = await milestoneService.deleteMilestone(id, userEmail);
      
      if (!deleted) {
        return errorResponse(res, 'Milestone not found or access denied', 404);
      }

      return successResponse(res, 'Milestone deleted successfully');
    } catch (error) {
      console.error('Error deleting milestone:', error);
      return errorResponse(res, 'Failed to delete milestone', 500);
    }
  }

  // Get milestones by status for a project
  async getMilestonesByStatus(req, res) {
    try {
      const { projectId } = req.params;
      const { status } = req.query;
      const userEmail = req.user.email;

      if (!status) {
        return errorResponse(res, 'Status parameter is required', 400);
      }

      console.log('Getting milestones by status:', status, 'for project:', projectId, 'for user:', userEmail);

      const milestones = await milestoneService.getMilestonesByStatus(projectId, userEmail, status);
      
      if (milestones === null) {
        return errorResponse(res, 'Project not found or access denied', 404);
      }

      return successResponse(res, `Milestones with status '${status}' retrieved successfully`, milestones);
    } catch (error) {
      console.error('Error getting milestones by status:', error);
      return errorResponse(res, 'Failed to retrieve milestones by status', 500);
    }
  }

  // Get upcoming milestones for a project
  async getUpcomingMilestones(req, res) {
    try {
      const { projectId } = req.params;
      const userEmail = req.user.email;

      console.log('Getting upcoming milestones for project:', projectId, 'for user:', userEmail);

      const milestones = await milestoneService.getUpcomingMilestones(projectId, userEmail);
      
      if (milestones === null) {
        return errorResponse(res, 'Project not found or access denied', 404);
      }

      return successResponse(res, 'Upcoming milestones retrieved successfully', milestones);
    } catch (error) {
      console.error('Error getting upcoming milestones:', error);
      return errorResponse(res, 'Failed to retrieve upcoming milestones', 500);
    }
  }

  // Get overdue milestones for a project
  async getOverdueMilestones(req, res) {
    try {
      const { projectId } = req.params;
      const userEmail = req.user.email;

      console.log('Getting overdue milestones for project:', projectId, 'for user:', userEmail);

      // You'll need to add this method to your milestone service
      const milestones = await milestoneService.getOverdueMilestones(projectId, userEmail);
      
      if (milestones === null) {
        return errorResponse(res, 'Project not found or access denied', 404);
      }

      return successResponse(res, 'Overdue milestones retrieved successfully', milestones);
    } catch (error) {
      console.error('Error getting overdue milestones:', error);
      return errorResponse(res, 'Failed to retrieve overdue milestones', 500);
    }
  }

  // Get milestone statistics for a project
  async getMilestoneStats(req, res) {
    try {
      const { projectId } = req.params;
      const userEmail = req.user.email;

      console.log('Getting milestone statistics for project:', projectId, 'for user:', userEmail);

      // You'll need to add this method to your milestone service
      const stats = await milestoneService.getMilestoneStats(projectId, userEmail);
      
      if (stats === null) {
        return errorResponse(res, 'Project not found or access denied', 404);
      }

      return successResponse(res, 'Milestone statistics retrieved successfully', stats);
    } catch (error) {
      console.error('Error getting milestone statistics:', error);
      return errorResponse(res, 'Failed to retrieve milestone statistics', 500);
    }
  }

  // Bulk update milestone status
  async bulkUpdateMilestoneStatus(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { projectId } = req.params;
      const { milestoneIds, status } = req.body;
      const userEmail = req.user.email;

      if (!Array.isArray(milestoneIds) || milestoneIds.length === 0) {
        return errorResponse(res, 'milestoneIds must be a non-empty array', 400);
      }

      if (!status) {
        return errorResponse(res, 'Status is required', 400);
      }

      console.log('Bulk updating milestone status for project:', projectId, 'by user:', userEmail);

      const results = [];
      
      for (const milestoneId of milestoneIds) {
        try {
          const milestone = await milestoneService.updateMilestone(milestoneId, userEmail, { status });
          if (milestone) {
            results.push({ 
              success: true, 
              milestoneId,
              milestone
            });
          } else {
            results.push({ 
              success: false, 
              milestoneId,
              error: 'Milestone not found or access denied'
            });
          }
        } catch (error) {
          results.push({ 
            success: false, 
            milestoneId,
            error: error.message
          });
        }
      }

      return successResponse(res, 'Milestone status updates processed', results);
    } catch (error) {
      console.error('Error bulk updating milestone status:', error);
      return errorResponse(res, 'Failed to bulk update milestone status', 500);
    }
  }

    // Create a new task under a milestone
  async createTask(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const taskData = {
        ...req.body,
        milestoneId: id
      };

      const tasks = await milestoneService.createTask(id, taskData);

      return successResponse(res, 'Task created successfully', tasks, 201);
    } catch (error) {
      console.error('Error creating task:', error);
      return errorResponse(res, 'Failed to create task', 500);
    }
  }
}

module.exports = new MilestoneController();