const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserService {
  // Get all users
  async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        select: {
          email: true,
          skillset: true,
          _count: {
            select: {
              createdProjects: true,
              projectMembers: true
            }
          }
        },
        orderBy: {
          email: 'asc'
        }
      });

      // Parse skillset for each user
      return users.map(user => ({
        ...user,
        id: user.email, // Use email as id for frontend compatibility
        skillset: user.skillset ? user.skillset.split(',').filter(Boolean) : []
      }));
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  // Get user by ID (email)
  async getUserById(userId, currentUserEmail) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: userId },
        select: {
          email: true,
          skillset: true,
          _count: {
            select: {
              createdProjects: true,
              projectMembers: true
            }
          }
        }
      });

      if (!user) {
        return null;
      }

      // Check if current user has access to view this user
      const hasAccess = await this.checkProfileAccess(user.email, currentUserEmail);
      if (!hasAccess) {
        return null;
      }

      return {
        ...user,
        id: user.email,
        name: user.email.split('@')[0],
        skillset: user.skillset ? user.skillset.split(',').filter(Boolean) : []
      };
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }

  // Create a new user
  async createUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        throw new Error('User already exists');
      }

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          skillset: Array.isArray(userData.skillset) ? userData.skillset.join(',') : (userData.skillset || '')
        },
        select: {
          email: true,
          skillset: true
        }
      });

      // Parse skillset back to array for response
      return {
        ...user,
        id: user.email, // Use email as id for frontend compatibility
        skillset: user.skillset ? user.skillset.split(',').filter(Boolean) : []
      };
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  // Get user by email (with access control)
  async getUserByEmail(email, currentUserEmail) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email },
        select: {
          email: true,
          skillset: true,
          _count: {
            select: {
              createdProjects: true,
              projectMembers: true
            }
          }
        }
      });

      if (!user) {
        return null;
      }

      // Check if current user has access to view this user
      const hasAccess = await this.checkProfileAccess(user.email, currentUserEmail);
      if (!hasAccess) {
        return null;
      }

      return {
        ...user,
        id: user.email, // Use email as id for frontend compatibility
        name: email.split('@')[0], // Extract name from email for display
        skillset: user.skillset ? user.skillset.split(',').map(skill => skill.trim()).filter(Boolean) : []
      };
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      throw error;
    }
  }

  // Update user (with access control)
  async updateUser(userId, currentUserEmail, updateData) {
    try {
      console.log('UpdateUser called with:', { userId, currentUserEmail, updateData });
      
      // Check if current user has permission to update
      const hasPermission = await this.checkUserPermission(userId, currentUserEmail, ['OWNER', 'ADMIN']);
      if (!hasPermission) {
        console.log('Permission denied for update');
        return null;
      }

      const updatePayload = {};
      if (updateData.skillset !== undefined) {
        updatePayload.skillset = Array.isArray(updateData.skillset) 
          ? updateData.skillset.join(',') 
          : updateData.skillset;
      }

      console.log('Updating user with payload:', updatePayload);
      console.log('Skillset being saved as string:', updatePayload.skillset);

      const user = await prisma.user.update({
        where: { email: userId }, // userId is actually email in our schema
        data: updatePayload,
        select: {
          email: true,
          skillset: true,
          _count: {
            select: {
              createdProjects: true,
              projectMembers: true
            }
          }
        }
      });

      console.log('User updated in database:', user);
      console.log('Raw skillset from DB:', user.skillset);

      // Parse skillset back to array for response - trim whitespace
      const parsedSkillset = user.skillset ? user.skillset.split(',').map(skill => skill.trim()).filter(Boolean) : [];
      console.log('Parsed skillset array:', parsedSkillset);

      const result = {
        ...user,
        id: user.email, // Use email as id for frontend compatibility
        name: user.email.split('@')[0], // Extract name from email for display
        skillset: parsedSkillset
      };

      console.log('Final result to return:', result);
      return result;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  // Delete user (with access control)
  async deleteUser(userId, currentUserEmail) {
    try {
      // Check if current user has permission to delete
      const hasPermission = await this.checkUserPermission(userId, currentUserEmail, ['OWNER', 'ADMIN']);
      if (!hasPermission) {
        return false;
      }

      await prisma.user.delete({
        where: { email: userId }
      });

      return true;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  }

  // Search users by skills
  async searchUsersBySkills(skills) {
    try {
      const users = await prisma.user.findMany({
        where: {
          skillset: {
            contains: skills.join(','),
            mode: 'insensitive'
          }
        },
        select: {
          email: true,
          skillset: true
        }
      });

      return users.map(user => ({
        ...user,
        id: user.email,
        name: user.email.split('@')[0],
        skillset: user.skillset ? user.skillset.split(',').filter(Boolean) : []
      }));
    } catch (error) {
      console.error('Error in searchUsersBySkills:', error);
      throw error;
    }
  }

  // Get users with specific skill
  async getUsersWithSkill(skill) {
    try {
      const users = await prisma.user.findMany({
        where: {
          skillset: {
            contains: skill,
            mode: 'insensitive'
          }
        },
        select: {
          email: true,
          skillset: true
        }
      });

      return users.map(user => ({
        ...user,
        id: user.email,
        name: user.email.split('@')[0],
        skillset: user.skillset ? user.skillset.split(',').filter(Boolean) : []
      }));
    } catch (error) {
      console.error('Error in getUsersWithSkill:', error);
      throw error;
    }
  }

  // Add skill to user
  async addUserSkill(userId, currentUserEmail, skill) {
    try {
      const hasPermission = await this.checkUserPermission(userId, currentUserEmail, ['OWNER']);
      if (!hasPermission) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: userId },
        select: { skillset: true }
      });

      if (!user) {
        return null;
      }

      const currentSkills = user.skillset ? user.skillset.split(',').filter(Boolean) : [];
      if (currentSkills.includes(skill)) {
        throw new Error('Skill already exists');
      }

      const updatedSkills = [...currentSkills, skill];
      const updatedUser = await prisma.user.update({
        where: { email: userId },
        data: { skillset: updatedSkills.join(',') },
        select: {
          email: true,
          skillset: true
        }
      });

      return {
        ...updatedUser,
        id: updatedUser.email,
        name: updatedUser.email.split('@')[0],
        skillset: updatedUser.skillset ? updatedUser.skillset.split(',').filter(Boolean) : []
      };
    } catch (error) {
      console.error('Error in addUserSkill:', error);
      throw error;
    }
  }

  // Update user skillset
  async updateUserSkillset(userId, currentUserEmail, skillset) {
    try {
      const hasPermission = await this.checkUserPermission(userId, currentUserEmail, ['OWNER']);
      if (!hasPermission) {
        return null;
      }

      const updatedUser = await prisma.user.update({
        where: { email: userId },
        data: { skillset: skillset.join(',') },
        select: {
          email: true,
          skillset: true
        }
      });

      return {
        ...updatedUser,
        id: updatedUser.email,
        name: updatedUser.email.split('@')[0],
        skillset: updatedUser.skillset ? updatedUser.skillset.split(',').filter(Boolean) : []
      };
    } catch (error) {
      console.error('Error in updateUserSkillset:', error);
      throw error;
    }
  }

  // Remove skill from user
  async removeUserSkill(userId, currentUserEmail, skill) {
    try {
      const hasPermission = await this.checkUserPermission(userId, currentUserEmail, ['OWNER']);
      if (!hasPermission) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: userId },
        select: { skillset: true }
      });

      if (!user) {
        return null;
      }

      const currentSkills = user.skillset ? user.skillset.split(',').filter(Boolean) : [];
      const updatedSkills = currentSkills.filter(s => s !== skill);

      const updatedUser = await prisma.user.update({
        where: { email: userId },
        data: { skillset: updatedSkills.join(',') },
        select: {
          email: true,
          skillset: true
        }
      });

      return {
        ...updatedUser,
        id: updatedUser.email,
        name: updatedUser.email.split('@')[0],
        skillset: updatedUser.skillset ? updatedUser.skillset.split(',').filter(Boolean) : []
      };
    } catch (error) {
      console.error('Error in removeUserSkill:', error);
      throw error;
    }
  }

  // Helper method to check profile access
  async checkProfileAccess(userId, currentUserEmail) {
    try {
      // Users can always view their own profile
      if (userId === currentUserEmail) {
        return true;
      }

      // For now, allow all authenticated users to view each other's profiles
      // You can add more restrictive logic here if needed
      return true;
    } catch (error) {
      console.error('Error in checkProfileAccess:', error);
      return false;
    }
  }

  // Helper method to check user permission
  async checkUserPermission(userId, currentUserEmail, allowedRoles) {
    try {
      console.log('Checking permission:', { userId, currentUserEmail, allowedRoles });
      
      // Check if user is trying to access their own profile
      if (allowedRoles.includes('OWNER') && userId === currentUserEmail) {
        console.log('Permission granted: User owns this profile');
        return true;
      }

      // Check if current user is admin (you can implement admin logic here)
      if (allowedRoles.includes('ADMIN')) {
        // For now, assume no admin role exists
        console.log('Admin check: No admin role implemented');
        return false;
      }

      console.log('Permission denied: No matching conditions');
      return false;
    } catch (error) {
      console.error('Error in checkUserPermission:', error);
      return false;
    }
  }
}

module.exports = new UserService();