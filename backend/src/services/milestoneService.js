const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class MilestoneService {
  // Check if user has permission to manage milestones (via project permission)
  async checkMilestonePermission(milestoneId, userEmail, requiredRoles = ['CREATOR', 'ADMIN']) {
    try {
      const milestone = await prisma.milestone.findUnique({
        where: { id: milestoneId },
        include: {
          project: {
            include: {
              creator: true,
              members: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      });

      if (!milestone) return false;

      const project = milestone.project;
      
      // Check if user is creator
      if (requiredRoles.includes('CREATOR') && project.creator.email === userEmail) {
        return true;
      }

      // Check if user is admin member
      if (requiredRoles.includes('ADMIN')) {
        const adminMember = project.members.find(
          member => member.user.email === userEmail && member.role === 'ADMIN'
        );
        if (adminMember) return true;
      }

      // Check if user is regular member (for read operations)
      if (requiredRoles.includes('ADMIN') || requiredRoles.includes('TASK_COMPLETER') || requiredRoles.includes('CREATOR')) {
        const member = project.members.find(
          member => member.user.email === userEmail
        );
        if (member) return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking milestone permission:', error);
      return false;
    }
  }

  // Check project permission for creating milestones
  async checkProjectPermission(projectId, userEmail, requiredRoles = ['CREATOR', 'ADMIN']) {
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          creator: true,
          members: {
            include: {
              user: true
            }
          }
        }
      });

      if (!project) return false;

      // Check if user is creator
      if (requiredRoles.includes('CREATOR') && project.creator.email === userEmail) {
        return true;
      }

      // Check if user is admin member
      if (requiredRoles.includes('ADMIN')) {
        const adminMember = project.members.find(
          member => member.user.email === userEmail && member.role === 'ADMIN'
        );
        if (adminMember) return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking project permission:', error);
      return false;
    }
  }

  // Create milestone (only project creator or admin can create)
  async createMilestone(projectId, userEmail, milestoneData) {
    try {
      // Check if user has permission to create milestones in this project
      const hasPermission = await this.checkProjectPermission(projectId, userEmail, ['CREATOR', 'ADMIN']);
      if (!hasPermission) {
        return null;
      }

      const milestone = await prisma.milestone.create({
        data: {
          name: milestoneData.name,
          description: milestoneData.description || null,
          startDate: milestoneData.startDate ? new Date(milestoneData.startDate) : null,
          endDate: milestoneData.endDate ? new Date(milestoneData.endDate) : null,
          status: milestoneData.status || 'PLANNED',
          projectId: projectId
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              creator: {
                select: {
                  email: true,
                  skillset: true
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

  // Get milestone by ID (project members can view)
  async getMilestoneById(milestoneId, userEmail) {
    try {
      // Check if user has permission to view this milestone
      const hasPermission = await this.checkMilestonePermission(milestoneId, userEmail, ['CREATOR', 'ADMIN', 'TASK_COMPLETER']);
      if (!hasPermission) {
        return null;
      }

      const milestone = await prisma.milestone.findUnique({
        where: { id: milestoneId },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              creator: {
                select: {
                  email: true,
                  skillset: true
                }
              }
            }
          }
        }
      });

      return milestone;
    } catch (error) {
      console.error('Error in getMilestoneById:', error);
      throw error;
    }
  }

  // Get all milestones for a project (project members can view)
  async getProjectMilestones(projectId, userEmail) {
    try {
      // Check if user has permission to view project milestones
      const hasPermission = await this.checkProjectPermission(projectId, userEmail, ['CREATOR', 'ADMIN', 'TASK_COMPLETER']);
      if (!hasPermission) {
        return null;
      }

      const milestones = await prisma.milestone.findMany({
        where: { projectId: projectId },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              creator: {
                select: {
                  email: true,
                  skillset: true
                }
              }
            }
          }
        },
        orderBy: {
          startDate: 'asc'
        }
      });

      return milestones;
    } catch (error) {
      console.error('Error in getProjectMilestones:', error);
      throw error;
    }
  }

  // Update milestone (only project creator or admin can update)
  async updateMilestone(milestoneId, userEmail, updateData) {
    try {
      // Check if user has permission to update this milestone
      const hasPermission = await this.checkMilestonePermission(milestoneId, userEmail, ['CREATOR', 'ADMIN']);
      if (!hasPermission) {
        return null;
      }

      const milestone = await prisma.milestone.update({
        where: { id: milestoneId },
        data: {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.description !== undefined && { description: updateData.description }),
          ...(updateData.status && { status: updateData.status }),
          ...(updateData.startDate && { startDate: new Date(updateData.startDate) }),
          ...(updateData.endDate && { endDate: new Date(updateData.endDate) })
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              creator: {
                select: {
                  email: true,
                  skillset: true
                }
              }
            }
          }
        }
      });

      return milestone;
    } catch (error) {
      console.error('Error in updateMilestone:', error);
      throw error;
    }
  }

  // Delete milestone (only project creator or admin can delete)
  async deleteMilestone(milestoneId, userEmail) {
    try {
      // Check if user has permission to delete this milestone
      const hasPermission = await this.checkMilestonePermission(milestoneId, userEmail, ['CREATOR', 'ADMIN']);
      if (!hasPermission) {
        return null;
      }

      const milestone = await prisma.milestone.delete({
        where: { id: milestoneId },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              creator: {
                select: {
                  email: true,
                  skillset: true
                }
              }
            }
          }
        }
      });

      return milestone;
    } catch (error) {
      console.error('Error in deleteMilestone:', error);
      throw error;
    }
  }

  // Get milestones by status for a project
  async getMilestonesByStatus(projectId, userEmail, status) {
    try {
      // Check if user has permission to view project milestones
      const hasPermission = await this.checkProjectPermission(projectId, userEmail, ['CREATOR', 'ADMIN', 'TASK_COMPLETER']);
      if (!hasPermission) {
        return null;
      }

      const milestones = await prisma.milestone.findMany({
        where: { 
          projectId: projectId,
          status: status
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              creator: {
                select: {
                  email: true,
                  skillset: true
                }
              }
            }
          }
        },
        orderBy: {
          startDate: 'asc'
        }
      });

      return milestones;
    } catch (error) {
      console.error('Error in getMilestonesByStatus:', error);
      throw error;
    }
  }

  // Get upcoming milestones for a project (within next 30 days)
  async getUpcomingMilestones(projectId, userEmail) {
    try {
      // Check if user has permission to view project milestones
      const hasPermission = await this.checkProjectPermission(projectId, userEmail, ['CREATOR', 'ADMIN', 'TASK_COMPLETER']);
      if (!hasPermission) {
        return null;
      }

      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const milestones = await prisma.milestone.findMany({
        where: { 
          projectId: projectId,
          endDate: {
            lte: thirtyDaysFromNow,
            gte: new Date()
          }
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              creator: {
                select: {
                  email: true,
                  skillset: true
                }
              }
            }
          }
        },
        orderBy: {
          endDate: 'asc'
        }
      });

      return milestones;
    } catch (error) {
      console.error('Error in getUpcomingMilestones:', error);
      throw error;
    }
  }

  // Create task under a milestone (only project creator or admin can create tasks)
  async createTask(milestoneId, taskData) {
    try {
      const task = await prisma.task.create({
        data: {
          title: taskData.title,
          description: taskData.description,
          assigneeId: taskData.assigneeId,
          milestoneId: milestoneId,
          priority: taskData.priority || 'MEDIUM',
          startDate: taskData.startDate ? new Date(taskData.startDate) : null,
          dueDate: taskData.dueDate ? new Date(taskData.endDate) : null,
          status: taskData.status || 'UPCOMING'
        },
        include: {
        assignee: {
          select: {
            email: true,
          }
        },
        milestone: {
          select: {
            id: true,
            name: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

      return task;
    } catch (error) {
      console.error('Error in createTask:', error);
      throw error;
    }
  }
  
}

module.exports = new MilestoneService();