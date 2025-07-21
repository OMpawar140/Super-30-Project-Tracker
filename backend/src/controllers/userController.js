const userService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/response');
const { validationResult } = require('express-validator');

class UserController {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      
      return successResponse(res, 'Users retrieved successfully', users);
    } catch (error) {
      console.error('Error getting all users:', error);
      return errorResponse(res, 'Failed to retrieve users', 500);
    }
  }

  // Create a new user
  async createUser(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const userData = req.body;
      const user = await userService.createUser(userData);
      
      return successResponse(res, 'User created successfully', user, 201);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.message === 'User already exists') {
        return errorResponse(res, 'User with this email already exists', 409);
      }
      return errorResponse(res, 'Failed to create user', 500);
    }
  }

  // Get user by ID
  async getUser(req, res) {
    try {
      const { id } = req.params;
      const currentUserEmail = req.user.email;

      const user = await userService.getUserById(id, currentUserEmail);
      
      if (!user) {
        return errorResponse(res, 'User not found or access denied', 404);
      }

      return successResponse(res, 'User retrieved successfully', user);
    } catch (error) {
      console.error('Error getting user:', error);
      return errorResponse(res, 'Failed to retrieve user', 500);
    }
  }

  // Get user by email
  async getUserByEmail(req, res) {
    try {
      const { email } = req.params;
      const currentUserEmail = req.user.email;

      console.log('Getting user by email:', email);
      console.log('Current user email:', currentUserEmail);

      // Decode the email parameter
      const decodedEmail = decodeURIComponent(email);
      console.log('Decoded email:', decodedEmail);

      const user = await userService.getUserByEmail(decodedEmail, currentUserEmail);
      
      if (!user) {
        console.log('User not found for email:', decodedEmail);
        return errorResponse(res, 'User not found or access denied', 404);
      }

      console.log('User found:', user);
      return successResponse(res, 'User retrieved successfully', user);
    } catch (error) {
      console.error('Error getting user by email:', error);
      return errorResponse(res, 'Failed to retrieve user', 500);
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const currentUserEmail = req.user.email;
      const updateData = req.body;

      console.log('Update user request:', {
        requestedUserId: id,
        currentUserEmail,
        updateData
      });

      const user = await userService.updateUser(id, currentUserEmail, updateData);
      
      if (!user) {
        console.log('Update failed: User not found or access denied');
        return errorResponse(res, 'User not found or access denied', 404);
      }

      console.log('Update successful:', user);
      return successResponse(res, 'User updated successfully', user);
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.message === 'Email already exists') {
        return errorResponse(res, 'Email already exists', 409);
      }
      return errorResponse(res, 'Failed to update user', 500);
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const currentUserEmail = req.user.email;

      const deleted = await userService.deleteUser(id, currentUserEmail);
      
      if (!deleted) {
        return errorResponse(res, 'User not found or access denied', 404);
      }

      return successResponse(res, 'User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      return errorResponse(res, 'Failed to delete user', 500);
    }
  }

  // Search users by skills
  async searchUsersBySkills(req, res) {
    try {
      const { skills } = req.query;
      
      if (!skills) {
        return errorResponse(res, 'Skills parameter is required', 400);
      }

      const skillArray = Array.isArray(skills) ? skills : skills.split(',');
      const users = await userService.searchUsersBySkills(skillArray);
      
      return successResponse(res, 'Users retrieved successfully', users);
    } catch (error) {
      console.error('Error searching users by skills:', error);
      return errorResponse(res, 'Failed to search users', 500);
    }
  }

  // Get users with specific skill
  async getUsersWithSkill(req, res) {
    try {
      const { skill } = req.params;
      const users = await userService.getUsersWithSkill(skill);
      
      return successResponse(res, 'Users retrieved successfully', users);
    } catch (error) {
      console.error('Error getting users with skill:', error);
      return errorResponse(res, 'Failed to retrieve users', 500);
    }
  }

  // Add skill to user
  async addUserSkill(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const { skill } = req.body;
      const currentUserEmail = req.user.email;

      const user = await userService.addUserSkill(id, currentUserEmail, skill);
      
      if (!user) {
        return errorResponse(res, 'User not found or access denied', 404);
      }

      return successResponse(res, 'Skill added successfully', user);
    } catch (error) {
      console.error('Error adding user skill:', error);
      if (error.message === 'Skill already exists') {
        return errorResponse(res, 'User already has this skill', 409);
      }
      return errorResponse(res, 'Failed to add skill', 500);
    }
  }

  // Update user skillset
  async updateUserSkillset(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const { skillset } = req.body;
      const currentUserEmail = req.user.email;

      const user = await userService.updateUserSkillset(id, currentUserEmail, skillset);
      
      if (!user) {
        return errorResponse(res, 'User not found or access denied', 404);
      }

      return successResponse(res, 'Skillset updated successfully', user);
    } catch (error) {
      console.error('Error updating user skillset:', error);
      return errorResponse(res, 'Failed to update skillset', 500);
    }
  }

  // Remove skill from user
  async removeUserSkill(req, res) {
    try {
      const { id, skill } = req.params;
      const currentUserEmail = req.user.email;

      const user = await userService.removeUserSkill(id, currentUserEmail, skill);
      
      if (!user) {
        return errorResponse(res, 'User not found, access denied, or skill not found', 404);
      }

      return successResponse(res, 'Skill removed successfully', user);
    } catch (error) {
      console.error('Error removing user skill:', error);
      return errorResponse(res, 'Failed to remove skill', 500);
    }
  }

  // Check profile access
  async checkProfileAccess(req, res) {
    try {
      const { id } = req.params;
      const currentUserEmail = req.user.email;

      const hasAccess = await userService.checkProfileAccess(id, currentUserEmail);
      
      if (!hasAccess) {
        return errorResponse(res, 'User not found or access denied', 404);
      }

      return successResponse(res, 'Profile access granted');
    } catch (error) {
      console.error('Error checking profile access:', error);
      return errorResponse(res, 'Failed to check profile access', 500);
    }
  }

  // Check user permission
  async checkUserPermission(req, res) {
    try {
      const { id } = req.params;
      const allowedRoles = req.body;
      const currentUserEmail = req.user.email;

      console.log('Checking user permissions for ID:', id, 'with roles:', allowedRoles);

      const hasPermission = await userService.checkUserPermission(id, currentUserEmail, allowedRoles);

      console.log(`Checking permissions for user ${currentUserEmail} on user ${id}`);
      console.log('Has permission:', hasPermission);
      
      if (!hasPermission) {
        return errorResponse(res, 'User not found or permission denied', 404);
      }

      return successResponse(res, 'User permission granted');
    } catch (error) {
      console.error('Error checking user permission:', error);
      return errorResponse(res, 'Failed to check user permission', 500);
    }
  }
}

module.exports = new UserController();