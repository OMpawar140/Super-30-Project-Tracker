const projectService = require('../services/projectService');
const milestoneService = require('../services/milestoneService');
const { successResponse, errorResponse } = require('../utils/response');
const { validationResult } = require('express-validator');
const emailService = require('../services/emailService');

class MilestoneController {
  // Get all milestones for a project
  async getProjectMilestones(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      const milestones = await projectService.getProjectMilestones(id, userEmail);
      
      return successResponse(res, 'Milestones retrieved successfully', milestones);
    } catch (error) {
      console.error('Error getting project milestones:', error);
      return errorResponse(res, 'Failed to retrieve milestones', 500);
    }
  }

  // Create a new milestone
  async createMilestone(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const userEmail = req.user.email;
      const milestoneData = {
        ...req.body,
        projectId: req.params.id,
        creatorId: userEmail
      };

      const milestone = await projectService.createMilestone(milestoneData);
      return successResponse(res, 'Milestone created successfully', milestone, 201);
    } catch (error) {
      console.error('Error creating milestone:', error);
      return errorResponse(res, 'Failed to create milestone', 500);
    }
  }

  // Get project by ID
  async getMilestone(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      const milestone = await projectService.getMilestoneById(id, userEmail);

      if (!milestone) {
        return errorResponse(res, 'Milestone not found or access denied', 404);
      }

      return successResponse(res, 'Milestone retrieved successfully', milestone);
    } catch (error) {
      console.error('Error getting milestone:', error);
      return errorResponse(res, 'Failed to retrieve milestone', 500);
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

      const project = await projectService.updateProject(id, userEmail, updateData);
      
      if (!project) {
        return errorResponse(res, 'Project not found or access denied', 404);
      }

      return successResponse(res, 'Project updated successfully', project);
    } catch (error) {
      console.error('Error updating project:', error);
      return errorResponse(res, 'Failed to update project', 500);
    }
  }

  // Delete project
  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      const deleted = await projectService.deleteProject(id, userEmail);
      
      if (!deleted) {
        return errorResponse(res, 'Project not found or access denied', 404);
      }

      return successResponse(res, 'Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      return errorResponse(res, 'Failed to delete project', 500);
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

  // Add project member
  async addProjectMember(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }
      
      const { id } = req.params;
      const userEmail = req.user.email;
      const members = Array.isArray(req.body) ? req.body : [req.body];
      console.log('Adding members to project:', id, 'by user:', userEmail, 'Members:', members);
      
      const results = [];
      
      // Get project details first for email context
      const projectDetails = await projectService.getProjectById(id, userEmail);
      if (!projectDetails) {
        return errorResponse(res, 'Project not found or access denied', 404);
      }

      console.log('Project details retrieved:', projectDetails);
      
      const inviterUser = await projectService.getUserByEmail(userEmail);

      console.log('Inviter user details:', inviterUser);
      
      for (const { userId, role } of members) {
        try {
          const member = await projectService.addProjectMember(id, userEmail, userId, role);
          if (member) {
            // Send welcome email
            try {
              await emailService.sendProjectWelcomeEmail(
                member.user.email,
                projectDetails.name,
                id,
                role || 'TASK_COMPLETER',
                inviterUser.name || inviterUser.email,
                userEmail
              );
              
              results.push({ 
                success: true, 
                member,
                emailSent: true
              });
            } catch (emailError) {
              console.error('Failed to send welcome email:', emailError);
              results.push({ 
                success: true, 
                member,
                emailSent: false,
                emailError: emailError.message
              });
            }
          } else {
            results.push({ 
              success: false, 
              error: 'Project not found, access denied, or user already a member', 
              userId 
            });
          }
        } catch (error) {
          results.push({ 
            success: false, 
            error: error.message, 
            userId 
          });
        }
      }
      
      return successResponse(res, 'Members processed', results, 201);
    } catch (error) {
      console.error('Error adding project member:', error);
      if (error.message === 'User not found') {
        return errorResponse(res, 'User not found', 404);
      }
      if (error.message === 'User already a member') {
        return errorResponse(res, 'User is already a member of this project', 409);
      }
      return errorResponse(res, 'Failed to add project member', 500);
    }
  }

  // Remove project member
  async removeProjectMember(req, res) {
    try {
      const { id, userId } = req.params;
      const userEmail = req.user.email;

      const removed = await projectService.removeProjectMember(id, userEmail, userId);
      
      if (!removed) {
        return errorResponse(res, 'Project not found, access denied, or member not found', 404);
      }

      return successResponse(res, 'Member removed successfully');
    } catch (error) {
      console.error('Error removing project member:', error);
      return errorResponse(res, 'Failed to remove project member', 500);
    }
  }

  // Get project members
  async getProjectMembers(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      const members = await projectService.getProjectMembers(id, userEmail);
      
      if (members === null) {
        return errorResponse(res, 'Project not found or access denied', 404);
      }

      return successResponse(res, 'Project members retrieved successfully', members);
    } catch (error) {
      console.error('Error getting project members:', error);
      return errorResponse(res, 'Failed to retrieve project members', 500);
    }
  }

  // Check a user's project permissions
  async checkProjectPermission(req, res) {
    try {
      const { id } = req.params;
      const allowedRoles = req.body;
      console.log('Checking project permissions for ID:', id, 'with roles:', allowedRoles);
      const userEmail = req.user.email;

      const hasPermission = await projectService.checkProjectPermission(id, userEmail, allowedRoles);

      console.log(`Checking permissions for user ${userEmail} on project ${id}`);
      
      console.log('Has permission:', hasPermission);
      if (!hasPermission) {
        return errorResponse(res, 'Project not found or access denied', 404);
      }

      return successResponse(res, 'User has access to project');
    } catch (error) {
      console.error('Error checking user project permissions:', error);
      return errorResponse(res, 'Failed to check user project permissions', 500);
    }
  }
  

  // Check project access
  async checkProjectAccess(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      const hasAccess = await projectService.checkProjectAccess(id, userEmail);
      
      if (!hasAccess) {
        return errorResponse(res, 'Project not found or access denied', 404);
      }

      return successResponse(res, 'Access granted to project');
    } catch (error) {
      console.error('Error checking project access:', error);
      return errorResponse(res, 'Failed to check project access', 500);
    }
  }

}

module.exports = new MilestoneController();