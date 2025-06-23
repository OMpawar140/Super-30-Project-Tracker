const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class UserService {
  // Get all users
  async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          skillset: true,
          name: true,
          bio: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              createdProjects: true,
              projectMemberships: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return users;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
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
          skillset: userData.skillset || [],
          name: userData.name || null,
          bio: userData.bio || null,
          status: userData.status || 'ACTIVE'
        },
        select: {
          id: true,
          email: true,
          skillset: true,
          name: true,
          bio: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return user;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  // Get user by ID (with access control)
  async getUserById(userId, currentUserEmail) {
    try {
      // Check if current user has access to view this user
      const hasAccess = await this.checkProfileAccess(userId, currentUserEmail);
      if (!hasAccess) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          skillset: true,
          name: true,
          bio: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          createdProjects: {
            select: {
              id: true,
              name: true,
              status: true,
              createdAt: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 5
          },
          projectMemberships: {
            select: {
              role: true,
              joinedAt: true,
              project: {
                select: {
                  id: true,
                  name: true,
                  status: true
                }
              }
            },
            orderBy: {
              joinedAt: 'desc'
            },
            take: 5
          },
          _count: {
            select: {
              createdProjects: true,
              projectMemberships: true
            }
          }
        }
      });

      return user;
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }

  // Get user by email (with access control)
  async getUserByEmail(email, currentUserEmail) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email }
      });

      if (!user) {
        return null;
      }

      // Check if current user has access to view this user
      const hasAccess = await this.checkProfileAccess(user.id, currentUserEmail);
      if (!hasAccess) {
        return null;
      }

      const userWithDetails = await prisma.user.findUnique({
        where: { email: email },
        select: {
          id: true,
          email: true,
          skillset: true,
          name: true,
          bio: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              createdProjects: true,
              projectMemberships: true
            }
          }
        }
      });

      return userWithDetails;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      throw error;
    }
  }

  // Update user (with access control)
  async updateUser(userId, currentUserEmail, updateData) {
    try {
      // Check if current user has permission to update
      const hasPermission = await this.checkUserPermission(userId, currentUserEmail, ['OWNER', 'ADMIN']);
      if (!hasPermission) {
        return null;
      }

      // If updating email, check if it already exists
      if (updateData.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: updateData.email }
        });

        if (existingUser && existingUser.id !== userId) {
          throw new Error('Email already exists');
        }
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(updateData.email && { email: updateData.email }),
          ...(updateData.skillset !== undefined && { skillset: updateData.skillset }),
          ...(updateData.name !== undefined && { name: updateData.name }),
          ...(updateData.bio !== undefined && { bio: updateData.bio }),
          ...(updateData.status && { status: updateData.status })
        },
        select: {
          id: true,
          email: true,
          skillset: true,
          name: true,
          bio: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return user;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  }

  // Delete user (with access control)
  async deleteUser(userId, currentUserEmail) {
    try {
      // Check if current user has permission to delete (only owner or admin)
      const hasPermission = await this.checkUserPermission(userId, currentUserEmail, ['OWNER', 'ADMIN']);
      if (!hasPermission) {
        return false;
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return false;
      }

      // In a real application, you might want to handle cascading deletes or archive instead
      await prisma.user.delete({
        where: { id: userId }
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
            hasSome: skills
          },
          status: 'ACTIVE' // Only return active users
        },
        select: {
          id: true,
          email: true,
          skillset: true,
          name: true,
          bio: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              createdProjects: true,
              projectMemberships: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Sort by number of matching skills
      const usersWithMatchCount = users.map(user => ({
        ...user,
        matchingSkills: user.skillset.filter(skill => 
          skills.some(searchSkill => 
            skill.toLowerCase().includes(searchSkill.toLowerCase())
          )
        ).length
      }));

      return usersWithMatchCount.sort((a, b) => b.matchingSkills - a.matchingSkills);
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
            has: skill
          },
          status: 'ACTIVE' // Only return active users
        },
        select: {
          id: true,
          email: true,
          skillset: true,
          name: true,
          bio: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              createdProjects: true,
              projectMemberships: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return users;
    } catch (error) {
      console.error('Error in getUsersWithSkill:', error);
      throw error;
    }
  }

  // Add skill to user
  async addUserSkill(userId, currentUserEmail, skill) {
    try {
      // Check if current user has permission to modify skills
      const hasPermission = await this.checkUserPermission(userId, currentUserEmail, ['OWNER', 'ADMIN']);
      if (!hasPermission) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { skillset: true }
      });

      if (!user) {
        return null;
      }

      // Check if skill already exists (case-insensitive)
      const skillExists = user.skillset.some(
        existingSkill => existingSkill.toLowerCase() === skill.toLowerCase()
      );

      if (skillExists) {
        throw new Error('Skill already exists');
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          skillset: {
            push: skill.trim()
          }
        },
        select: {
          id: true,
          email: true,
          skillset: true,
          name: true,
          bio: true,
          status: true,
          updatedAt: true
        }
      });

      return updatedUser;
    } catch (error) {
      console.error('Error in addUserSkill:', error);
      throw error;
    }
  }

  // Update user skillset
  async updateUserSkillset(userId, currentUserEmail, skillset) {
    try {
      // Check if current user has permission to modify skills
      const hasPermission = await this.checkUserPermission(userId, currentUserEmail, ['OWNER', 'ADMIN']);
      if (!hasPermission) {
        return null;
      }

      // Remove duplicates and trim skills
      const cleanSkillset = [...new Set(skillset.map(skill => skill.trim()))];

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          skillset: cleanSkillset
        },
        select: {
          id: true,
          email: true,
          skillset: true,
          name: true,
          bio: true,
          status: true,
          updatedAt: true
        }
      });

      return updatedUser;
    } catch (error) {
      console.error('Error in updateUserSkillset:', error);
      throw error;
    }
  }

  // Remove skill from user
  async removeUserSkill(userId, currentUserEmail, skill) {
    try {
      // Check if current user has permission to modify skills
      const hasPermission = await this.checkUserPermission(userId, currentUserEmail, ['OWNER', 'ADMIN']);
      if (!hasPermission) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { skillset: true }
      });

      if (!user) {
        return null;
      }

      // Remove skill (case-insensitive)
      const updatedSkillset = user.skillset.filter(
        existingSkill => existingSkill.toLowerCase() !== skill.toLowerCase()
      );

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          skillset: updatedSkillset
        },
        select: {
          id: true,
          email: true,
          skillset: true,
          name: true,
          bio: true,
          status: true,
          updatedAt: true
        }
      });

      return updatedUser;
    } catch (error) {
      console.error('Error in removeUserSkill:', error);
      throw error;
    }
  }

  // Helper method to check profile access
  async checkProfileAccess(userId, currentUserEmail) {
    try {
      // Get current user
      const currentUser = await prisma.user.findUnique({
        where: { email: currentUserEmail }
      });

      if (!currentUser) {
        return false;
      }

      // Users can always view their own profile
      if (currentUser.id === userId) {
        return true;
      }

      // Check if users are in the same project
      const sharedProjects = await prisma.project.findFirst({
        where: {
          OR: [
            {
              AND: [
                { creatorId: currentUserEmail },
                {
                  members: {
                    some: {
                      user: { id: userId }
                    }
                  }
                }
              ]
            },
            {
              AND: [
                {
                  members: {
                    some: {
                      userId: currentUserEmail
                    }
                  }
                },
                {
                  OR: [
                    {
                      creator: { id: userId }
                    },
                    {
                      members: {
                        some: {
                          user: { id: userId }
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      });

      return !!sharedProjects;
    } catch (error) {
      console.error('Error in checkProfileAccess:', error);
      return false;
    }
  }

  // Helper method to check user permission
  async checkUserPermission(userId, currentUserEmail, allowedRoles) {
    try {
      const currentUser = await prisma.user.findUnique({
        where: { email: currentUserEmail }
      });

      if (!currentUser) {
        return false;
      }

      // Check if user is trying to access their own profile
      if (allowedRoles.includes('OWNER') && currentUser.id === userId) {
        return true;
      }

      // Check if current user is admin (you can implement admin logic here)
      if (allowedRoles.includes('ADMIN')) {
        // For now, assume no admin role exists
        // You can add admin logic here based on your requirements
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error in checkUserPermission:', error);
      return false;
    }
  }
}

module.exports = new UserService();