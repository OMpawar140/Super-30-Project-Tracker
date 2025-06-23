const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TaskService {
  // Check if user has permission to manage tasks (via milestone/project permission)
  async checkTaskPermission(taskId, userEmail, requiredRoles = ['CREATOR', 'ADMIN']) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          milestone: {
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
          },
          assignee: true
        }
      });

      if (!task) return false;

      const project = task.milestone.project;
      
      // Check if user is project creator
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

      // Check if user is task assignee (for task completion and viewing)
      if (requiredRoles.includes('TASK_COMPLETER') && task.assignee && task.assignee.email === userEmail) {
        return true;
      }

      // Check if user is regular member (for read operations)
      if (requiredRoles.includes('MEMBER')) {
        const member = project.members.find(
          member => member.user.email === userEmail
        );
        if (member) return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking task permission:', error);
      return false;
    }
  }

  // Check milestone permission for creating tasks
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
      
      // Check if user is project creator
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
      if (requiredRoles.includes('MEMBER')) {
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

  // Create task (only project creator or admin can create)
  async createTask(milestoneId, userEmail, taskData) {
    try {
      // Check if user has permission to create tasks in this milestone
      const hasPermission = await this.checkMilestonePermission(milestoneId, userEmail, ['CREATOR', 'ADMIN']);
      if (!hasPermission) {
        return null;
      }

      const task = await prisma.task.create({
        data: {
          title: taskData.title,
          description: taskData.description || null,
          priority: taskData.priority || 'MEDIUM',
          status: taskData.status || 'UPCOMING',
          startDate: taskData.startDate ? new Date(taskData.startDate) : null,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
          milestoneId: milestoneId,
          assigneeId: taskData.assigneeId || null
        },
        include: {
          assignee: {
            select: {
           
              email: true,
              skillset: true
            }
          },
          milestone: {
            select: {
              id: true,
              name: true,
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
          }
        }
      });

      return task;
    } catch (error) {
      console.error('Error in createTask:', error);
      throw error;
    }
  }

  // Get task by ID (project members and assignee can view)
  async getTaskById(taskId, userEmail) {
    try {
      // Check if user has permission to view this task
      const hasPermission = await this.checkTaskPermission(taskId, userEmail, ['CREATOR', 'ADMIN', 'TASK_COMPLETER', 'MEMBER']);
      if (!hasPermission) {
        return null;
      }

      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          },
          milestone: {
            select: {
              id: true,
              name: true,
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
          }
        }
      });

      return task;
    } catch (error) {
      console.error('Error in getTaskById:', error);
      throw error;
    }
  }

  // Get all tasks for a milestone (project members can view)
  async getMilestoneTasks(milestoneId, userEmail) {
    try {
      // Check if user has permission to view milestone tasks
      const hasPermission = await this.checkMilestonePermission(milestoneId, userEmail, ['CREATOR', 'ADMIN', 'MEMBER']);
      if (!hasPermission) {
        return null;
      }

      const tasks = await prisma.task.findMany({
        where: { milestoneId: milestoneId },
        include: {
          assignee: {
            select: {
             
              email: true,
              skillset: true
            }
          },
          milestone: {
            select: {
              id: true,
              name: true,
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
          }
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' }
        ]
      });

      return tasks;
    } catch (error) {
      console.error('Error in getMilestoneTasks:', error);
      throw error;
    }
  }

  // Get tasks assigned to a specific user
  async getAssignedTasks(userEmail, projectId = null) {
    try {
      const whereClause = {
        assignee: {
          email: userEmail
        }
      };

      // If projectId is provided, filter by project
      if (projectId) {
        whereClause.milestone = {
          projectId: projectId
        };
      }

      const tasks = await prisma.task.findMany({
        where: whereClause,
        include: {
          assignee: {
            select: {
            
              email: true,
              skillset: true
            }
          },
          milestone: {
            select: {
              id: true,
              name: true,
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
          }
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' }
        ]
      });

      return tasks;
    } catch (error) {
      console.error('Error in getAssignedTasks:', error);
      throw error;
    }
  }

  // Update task (only project creator, admin, or assignee can update)
  async updateTask(taskId, userEmail, updateData) {
    try {
      // For status updates, allow assignee to update
      const allowedRoles = updateData.status ? ['CREATOR', 'ADMIN', 'TASK_COMPLETER'] : ['CREATOR', 'ADMIN'];
      
      // Check if user has permission to update this task
      const hasPermission = await this.checkTaskPermission(taskId, userEmail, allowedRoles);
      if (!hasPermission) {
        return null;
      }

      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          ...(updateData.title && { title: updateData.title }),
          ...(updateData.description !== undefined && { description: updateData.description }),
          ...(updateData.priority && { priority: updateData.priority }),
          ...(updateData.status && { status: updateData.status }),
          ...(updateData.startDate && { startDate: new Date(updateData.startDate) }),
          ...(updateData.dueDate && { dueDate: new Date(updateData.dueDate) }),
          ...(updateData.assigneeId !== undefined && { assigneeId: updateData.assigneeId })
        },
        include: {
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          },
          milestone: {
            select: {
              id: true,
              name: true,
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
          }
        }
      });

      return task;
    } catch (error) {
      console.error('Error in updateTask:', error);
      throw error;
    }
  }

  // Delete task (only project creator or admin can delete)
  async deleteTask(taskId, userEmail) {
    try {
      // Check if user has permission to delete this task
      const hasPermission = await this.checkTaskPermission(taskId, userEmail, ['CREATOR', 'ADMIN']);
      if (!hasPermission) {
        return null;
      }

      const task = await prisma.task.delete({
        where: { id: taskId },
        include: {
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          },
          milestone: {
            select: {
              id: true,
              name: true,
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
          }
        }
      });

      return task;
    } catch (error) {
      console.error('Error in deleteTask:', error);
      throw error;
    }
  }

  // Get tasks by status for a milestone
  async getTasksByStatus(milestoneId, userEmail, status) {
    try {
      // Check if user has permission to view milestone tasks
      const hasPermission = await this.checkMilestonePermission(milestoneId, userEmail, ['CREATOR', 'ADMIN', 'MEMBER']);
      if (!hasPermission) {
        return null;
      }

      const tasks = await prisma.task.findMany({
        where: { 
          milestoneId: milestoneId,
          status: status
        },
        include: {
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          },
          milestone: {
            select: {
              id: true,
              name: true,
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
          }
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' }
        ]
      });

      return tasks;
    } catch (error) {
      console.error('Error in getTasksByStatus:', error);
      throw error;
    }
  }

  // Get tasks by priority for a milestone
  async getTasksByPriority(milestoneId, userEmail, priority) {
    try {
      // Check if user has permission to view milestone tasks
      const hasPermission = await this.checkMilestonePermission(milestoneId, userEmail, ['CREATOR', 'ADMIN', 'MEMBER']);
      if (!hasPermission) {
        return null;
      }

      const tasks = await prisma.task.findMany({
        where: { 
          milestoneId: milestoneId,
          priority: priority
        },
        include: {
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          },
          milestone: {
            select: {
              id: true,
              name: true,
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
          }
        },
        orderBy: {
          dueDate: 'asc'
        }
      });

      return tasks;
    } catch (error) {
      console.error('Error in getTasksByPriority:', error);
      throw error;
    }
  }

  // Get overdue tasks for a milestone
  async getOverdueTasks(milestoneId, userEmail) {
    try {
      // Check if user has permission to view milestone tasks
      const hasPermission = await this.checkMilestonePermission(milestoneId, userEmail, ['CREATOR', 'ADMIN', 'MEMBER']);
      if (!hasPermission) {
        return null;
      }

      const tasks = await prisma.task.findMany({
        where: { 
          milestoneId: milestoneId,
          dueDate: {
            lt: new Date()
          },
          status: {
            not: 'COMPLETED'
          }
        },
        include: {
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          },
          milestone: {
            select: {
              id: true,
              name: true,
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
          }
        },
        orderBy: {
          dueDate: 'asc'
        }
      });

      return tasks;
    } catch (error) {
      console.error('Error in getOverdueTasks:', error);
      throw error;
    }
  }

  // Get upcoming tasks for a user (within next 7 days)
  async getUpcomingTasks(userEmail, days = 7) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const tasks = await prisma.task.findMany({
        where: { 
          assignee: {
            email: userEmail
          },
          dueDate: {
            lte: futureDate,
            gte: new Date()
          },
          status: {
            not: 'COMPLETED'
          }
        },
        include: {
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          },
          milestone: {
            select: {
              id: true,
              name: true,
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
          }
        },
        orderBy: {
          dueDate: 'asc'
        }
      });

      return tasks;
    } catch (error) {
      console.error('Error in getUpcomingTasks:', error);
      throw error;
    }
  }

  // Assign task to user (only project creator or admin can assign)
  async assignTask(taskId, userEmail, assigneeId) {
    try {
      // Check if user has permission to assign this task
      const hasPermission = await this.checkTaskPermission(taskId, userEmail, ['CREATOR', 'ADMIN']);
      if (!hasPermission) {
        return null;
      }

      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          assigneeId: assigneeId
        },
        include: {
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          },
          milestone: {
            select: {
              id: true,
              name: true,
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
          }
        }
      });

      return task;
    } catch (error) {
      console.error('Error in assignTask:', error);
      throw error;
    }
  }

  // Complete task (assignee, creator, or admin can complete)
  async completeTask(taskId, userEmail) {
    try {
      // Check if user has permission to complete this task
      const hasPermission = await this.checkTaskPermission(taskId, userEmail, ['CREATOR', 'ADMIN', 'TASK_COMPLETER']);
      if (!hasPermission) {
        return null;
      }

      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'COMPLETED'
        },
        include: {
          assignee: {
            select: {
        
              email: true,
              skillset: true
            }
          },
          milestone: {
            select: {
              id: true,
              name: true,
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
          }
        }
      });

      return task;
    } catch (error) {
      console.error('Error in completeTask:', error);
      throw error;
    }
  }
}

module.exports = new TaskService();