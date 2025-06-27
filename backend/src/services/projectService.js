const { PrismaClient } = require('@prisma/client');
const NotificationTriggers = require('../utils/notificationTriggers');
const prisma = new PrismaClient();

class ProjectService {
  // Get all projects where user is creator or member
  async getUserProjects(userEmail) {
    try {
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { creatorId: userEmail },
            {
              members: {
                some: {
                  userId: userEmail
                }
              }
            }
          ]
        },
        include: {
          creator: {
            select: {
              email: true,
              skillset: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  email: true,
                  skillset: true
                }
              }
            }
          },
          milestones: {
            include: {
              tasks: true
            }
          },
          _count: {
            select: {
              milestones: true,
              members: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      return projects;
    } catch (error) {
      console.error('Error in getUserProjects:', error);
      throw error;
    }
  }

  // Get N projects where user is creator or member
  async getNUserProjects(userEmail, limit = 3) {
    try {
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { creatorId: userEmail },
            {
              members: {
                some: {
                  userId: userEmail
                }
              }
            }
          ]
        },
        include: {
          creator: {
            select: {
              email: true,
              skillset: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  email: true,
                  skillset: true
                }
              }
            }
          },
          milestones: {
            include: {
              tasks: true
            }
          },
          _count: {
            select: {
              milestones: true,
              members: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        take: parseInt(limit)
      });

      return projects;
    } catch (error) {
      console.error('Error in getUserProjects:', error);
      throw error;
    }
  }

  // Create a new project
  async createProject(projectData) {
    try {
      // Create the project
      const project = await prisma.project.create({
        data: {
          name: projectData.name,
          description: projectData.description,
          startDate: projectData.startDate ? new Date(projectData.startDate) : null,
          endDate: projectData.endDate ? new Date(projectData.endDate) : null,
          creatorId: projectData.creatorId,
          members: {
          create: [
            {
              userId: projectData.creatorId,
              role: 'CREATOR'
            }
          ]
          }
        },
        include: {
          creator: {
        select: {
          email: true,
          skillset: true
        }
          },
          members: {
            include: {
              user: {
                select: {
              email: true,
              skillset: true
                }
              }
            }
          }
        }
      });

      return project;
    } catch (error) {
      console.error('Error in createProject:', error);
      throw error;
    }
  }

  // Get project by ID (with access control)
  async getProjectById(projectId, userEmail) {
    try {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { creatorId: userEmail },
            {
              members: {
                some: {
                  userId: userEmail
                }
              }
            }
          ]
        },
        include: {
          creator: {
            select: {
              email: true,
              skillset: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  email: true,
                  skillset: true
                }
              }
            }
          },
          milestones: {
            include: {
              tasks: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  priority: true,
                  assigneeId: true,
                  dueDate: true
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });

      return project;
    } catch (error) {
      console.error('Error in getProjectById:', error);
      throw error;
    }
  }

  // Update project (only creator or admin can update)
  async updateProject(projectId, userEmail, updateData) {
    try {
      // First check if user has permission to update
      const hasPermission = await this.checkProjectPermission(projectId, userEmail, ['CREATOR', 'ADMIN']);
      if (!hasPermission) {
        return null;
      }

      const project = await prisma.project.update({
        where: {
          id: projectId
        },
        data: {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.description !== undefined && { description: updateData.description }),
          ...(updateData.status && { status: updateData.status }),
          ...(updateData.startDate && { startDate: new Date(updateData.startDate) }),
          ...(updateData.endDate && { endDate: new Date(updateData.endDate) })
        },
        include: {
          creator: {
            select: {
              email: true,
              skillset: true
            }
          },
          members: {
            include: {
              user: {
                select: {
                  email: true,
                  skillset: true
                }
              }
            }
          }
        }
      });

      return project;
    } catch (error) {
      console.error('Error in updateProject:', error);
      throw error;
    }
  }

  // Delete project (only creator can delete)
  async deleteProject(projectId, userEmail) {
    try {
      // First check if user is the creator
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          creatorId: userEmail
        }
      });

      if (!project) {
        return false;
      }

      await prisma.project.delete({
        where: {
          id: projectId
        }
      });

      return true;
    } catch (error) {
      console.error('Error in deleteProject:', error);
      throw error;
    }
  }

  async createMilestone(id, milestoneData) {
    try {
      const milestone = await prisma.milestone.create({
        data: {
          name: milestoneData.name,
          description: milestoneData.description,
          startDate: milestoneData.startDate ? new Date(milestoneData.startDate) : null,
          endDate: milestoneData.endDate ? new Date(milestoneData.endDate) : null,
          projectId: id,
          status: milestoneData.status || 'PLANNED',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          project: {
            select: {
              id: true,
            }
          },
          tasks: {
            include: {
              assignee: {
                select: {
                  email: true,
                }
              }
            }
          }
        }
      });

      return milestone;
    } catch (error) {
      console.error('Error in createMilestone:', error);
      throw error;
    }
  }

  // Get user by email
  async getUserByEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        skillset: true
      }
    });
    
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
  }

  // Add project member
  async addProjectMember(projectId, userEmail, memberUserId, role) {
    try {
      // Check if user has permission to add members (creator or admin)
      const hasPermission = await this.checkProjectPermission(projectId, userEmail, ['CREATOR', 'ADMIN']);
      if (!hasPermission) {
        return null;
      }

      // Check if the user to be added exists
      const userExists = await prisma.user.findUnique({
        where: { email: memberUserId }
      });

      if (!userExists) {
        // If user does not exist, create a new user
        await prisma.user.create({
          data: {
        email: memberUserId
          }
        });
      }

      // Check if user is already a member
      const existingMember = await prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: memberUserId,
            projectId: projectId
          }
        }
      });

      if (existingMember) {
        throw new Error('User already a member');
      }

      const member = await prisma.projectMember.create({
        data: {
          userId: memberUserId,
          projectId: projectId,
          role: role || 'TASK_COMPLETER'
        },
        include: {
          user: {
            select: {
              email: true,
              skillset: true
            }
          },

       // Include project data for notification
          project: {
            select: {
              id: true,
              name: true,
              creator: {
                select: {
                  email: true
                }
              }
            }
          }
        }
      });

      // Send notification to the new member
      try {
        await NotificationTriggers.projectMemberAdded(member.project, memberUserId);
        console.log(`Notification sent for member added: ${memberUserId} to project ${member.project.name}`);
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError);
        // Don't throw - member was added successfully, notification failure shouldn't break the flow
      }

      return member;
    } catch (error) {
      console.error('Error in addProjectMember:', error);
      throw error;
    }
  }

  // Remove project member
  async removeProjectMember(projectId, userEmail, memberUserId) {
    try {
      // Check if user has permission to remove members (creator or admin)
      const hasPermission = await this.checkProjectPermission(projectId, userEmail, ['CREATOR', 'ADMIN']);
      if (!hasPermission) {
        return false;
      }

      // Cannot remove the creator
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { creatorId: true }
      });

      if (project && project.creatorId === memberUserId) {
        return false; // Cannot remove creator
      }

      const deletedMember = await prisma.projectMember.deleteMany({
        where: {
          userId: memberUserId,
          projectId: projectId
        }
      });

      return deletedMember.count > 0;
    } catch (error) {
      console.error('Error in removeProjectMember:', error);
      throw error;
    }
  }

  // Get project members
  async getProjectMembers(projectId, userEmail) {
    try {
      // Check if user has access to the project
      const hasAccess = await this.checkProjectAccess(projectId, userEmail);
      if (!hasAccess) {
        return null;
      }

      const members = await prisma.projectMember.findMany({
        where: {
          projectId: projectId
        },
        include: {
          user: {
            select: {
              email: true,
              skillset: true
            }
          }
        },
        orderBy: {
          joinedAt: 'asc'
        }
      });

      // Also include the creator
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          creator: {
            select: {
              email: true,
              skillset: true
            }
          }
        }
      });

      const allMembers = [
        {
          id: 'creator',
          role: 'CREATOR',
          joinedAt: project.createdAt,
          user: project.creator
        },
        ...members
      ];

      return allMembers;
    } catch (error) {
      console.error('Error in getProjectMembers:', error);
      throw error;
    }
  }

  // Helper method to check project permission
  async checkProjectPermission(projectId, userEmail, allowedRoles) {
    try {
    const project = await this.getProjectById(projectId, userEmail);

      if (!project) return false;

      // Check if user is creator
      if (allowedRoles.includes('CREATOR') && project.creatorId === userEmail) {
        return true;
      }

      // Check if user is member with required role
      if (project.members.length > 0) {
        const memberRole = project.members[0].role;
        return allowedRoles.includes(memberRole);
      }

      return false;
    } catch (error) {
      console.error('Error in checkProjectPermission:', error);
      return false;
    }
  }

  // Helper method to check project access
  async checkProjectAccess(projectId, userEmail) {
    try {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { creatorId: userEmail },
            {
              members: {
                some: {
                  userId: userEmail
                }
              }
            }
          ]
        }
      });

      return !!project;
    } catch (error) {
      console.error('Error in checkProjectAccess:', error);
      return false;
    }
  }
}

module.exports = new ProjectService();