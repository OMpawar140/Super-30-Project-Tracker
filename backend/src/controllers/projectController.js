const projectService = require('../services/projectService');
const { successResponse, errorResponse } = require('../utils/response');
const { validationResult } = require('express-validator');
const emailService = require('../services/emailService');

class ProjectController {
  // Get all projects for authenticated user
  async getUserProjects(req, res) {
    try {
      const userEmail = req.user.email;
      console.log('Getting projects for user:', userEmail);
      const projects = await projectService.getUserProjects(userEmail);
      
      return successResponse(res, 'Projects retrieved successfully', projects);
    } catch (error) {
      console.error('Error getting user projects:', error);
      return errorResponse(res, 'Failed to retrieve projects', 500);
    }
  }

  // Create a new project
  async createProject(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const userEmail = req.user.email;
      const projectData = {
        ...req.body,
        creatorId: userEmail
      };

      const project = await projectService.createProject(projectData);
      
      return successResponse(res, 'Project created successfully', project, 201);
    } catch (error) {
      console.error('Error creating project:', error);
      return errorResponse(res, 'Failed to create project', 500);
    }
  }

  // Get project by ID
  async getProject(req, res) {
    try {
      const { id } = req.params;
      const userEmail = req.user.email;

      const project = await projectService.getProjectById(id, userEmail);
      
      if (!project) {
        return errorResponse(res, 'Project not found or access denied', 404);
      }

      return successResponse(res, 'Project retrieved successfully', project);
    } catch (error) {
      console.error('Error getting project:', error);
      return errorResponse(res, 'Failed to retrieve project', 500);
    }
  }

  // Update project
  async updateProject(req, res) {
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

  // Create a new milestone
  async createMilestone(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const milestoneData = {
        ...req.body,
        projectId: id
      };

      const milestone = await projectService.createMilestone(id, milestoneData);

      return successResponse(res, 'Milestone created successfully', milestone, 201);
    } catch (error) {
      console.error('Error creating milestone:', error);
      return errorResponse(res, 'Failed to create milestone', 500);
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

module.exports = new ProjectController();