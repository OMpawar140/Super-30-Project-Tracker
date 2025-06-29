const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TaskService {
  // Get all tasks for a milestone
  async getMilestoneTasks(milestoneId, userEmail) {
    try {
      // First check if user has access to the milestone's project
      const milestone = await prisma.milestone.findFirst({
        where: { id: milestoneId },
        include: {
          project: {
            include: {
              members: {
                where: { userId: userEmail }
              }
            }
          }
        }
      });

      if (!milestone || 
          (milestone.project.creatorId !== userEmail && 
           milestone.project.members.length === 0)) {
        return null;
      }

      const tasks = await prisma.task.findMany({
        where: { milestoneId },
        include: {
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          },
          creator: {
            select: {
              email: true,
              skillset: true
            }
          },
          comments: {
            include: {
              author: {
                select: {
                  email: true,
                  skillset: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'asc' }
        ]
      });

      return tasks;
    } catch (error) {
      console.error('Error in getMilestoneTasks:', error);
      throw error;
    }
  }

  // Get all tasks for a project
  async getProjectTasks(projectId, userEmail) {
    try {
      // Check if user has access to the project
      const hasAccess = await this.checkProjectAccess(projectId, userEmail);
      if (!hasAccess) {
        return null;
      }

      const tasks = await prisma.task.findMany({
        where: {
          milestone: {
            projectId: projectId
          }
        },
        include: {
          milestone: {
            select: {
              id: true,
              name: true
            }
          },
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          },
          creator: {
            select: {
              email: true,
              skillset: true
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: [
          { milestone: { createdAt: 'asc' } },
          { order: 'asc' },
          { createdAt: 'asc' }
        ]
      });

      return tasks;
    } catch (error) {
      console.error('Error in getProjectTasks:', error);
      throw error;
    }
  }

  // Get task by ID
  async getTaskById(taskId, userEmail) {
    try {
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          milestone: {
            project: {
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
          }
        },
        include: {
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
          },
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          },
        }
      });

      return task;
    } catch (error) {
      console.error('Error in getTaskById:', error);
      throw error;
    }
  }

  // Create new task
  async createTask(milestoneId, userEmail, taskData) {
    try {
      // Check if user has permission to create tasks in this milestone
      const hasPermission = await this.checkMilestonePermission(milestoneId, userEmail, ['CREATOR', 'ADMIN', 'TASK_MANAGER']);
      if (!hasPermission) {
        return null;
      }

      // Get the next order number for the milestone
      const lastTask = await prisma.task.findFirst({
        where: { milestoneId },
        orderBy: { order: 'desc' }
      });

      const nextOrder = lastTask ? lastTask.order + 1 : 1;

      const task = await prisma.task.create({
        data: {
          title: taskData.title,
          description: taskData.description,
          status: taskData.status || 'TODO',
          priority: taskData.priority || 'MEDIUM',
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
          estimatedHours: taskData.estimatedHours || null,
          assigneeId: taskData.assignedTo || null,
          milestoneId,
          createdBy: userEmail,
          order: nextOrder,
          tags: taskData.tags || []
        },
        include: {
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
          },
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          },
          creator: {
            select: {
              email: true,
              skillset: true
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

  // Update existing task
  async updateTask(taskId, userEmail, updateData) {
    try {
      // Check if user has permission to update this task
      const hasPermission = await this.checkTaskPermission(taskId, userEmail, ['CREATOR', 'ADMIN', 'TASK_MANAGER']);
      if (!hasPermission) {
        return null;
      }

      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          ...(updateData.title && { title: updateData.title }),
          ...(updateData.description !== undefined && { description: updateData.description }),
          ...(updateData.status && { status: updateData.status }),
          ...(updateData.priority && { priority: updateData.priority }),
          ...(updateData.dueDate !== undefined && { 
            dueDate: updateData.dueDate ? new Date(updateData.dueDate) : null 
          }),
          ...(updateData.estimatedHours !== undefined && { estimatedHours: updateData.estimatedHours }),
          ...(updateData.actualHours !== undefined && { actualHours: updateData.actualHours }),
          ...(updateData.assignedTo !== undefined && { assigneeId: updateData.assignedTo }),
          ...(updateData.tags && { tags: updateData.tags }),
          updatedAt: new Date()
        },
        include: {
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
          },
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          },
          creator: {
            select: {
              email: true,
              skillset: true
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

  // Delete task
  async deleteTask(taskId, userEmail) {
    try {
      // Check if user has permission to delete this task
      const hasPermission = await this.checkTaskPermission(taskId, userEmail, ['CREATOR', 'ADMIN', 'TASK_MANAGER']);
      if (!hasPermission) {
        return false;
      }

      await prisma.task.delete({
        where: { id: taskId }
      });

      return true;
    } catch (error) {
      console.error('Error in deleteTask:', error);
      throw error;
    }
  }

  async submitTaskReview(taskId, userEmail, reviewData) {
    try {
      // Check if user has permission to review tasks in this milestone
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          milestone: {
            select: {
              id: true,
              projectId: true
            }
          }
        }
      });

      if (!task) {
        return null; // Task not found
      }

      const hasPermission = await this.checkMilestonePermission(
        task.milestone.id, 
        userEmail, 
        ['CREATOR', 'ADMIN']
      );
      
      if (!hasPermission) {
        return null;
      }

      const taskReview = await prisma.taskReview.create({
        data: {
          status: reviewData.status,
          comment: reviewData.comment || null,
          taskId,
          reviewerId: userEmail,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          task: {
            select: {
              id: true,
              title: true,
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
          },
          reviewer: {
            select: {
              email: true,
              skillset: true
            }
          }
        }
      });

      return taskReview;
    } catch (error) {
      console.error('Error in submitTaskReview:', error);
      throw error;
    }
  }

  // Update task status
  async updateTaskStatus(taskId, userEmail, status) {
    try {
      // Users can update status if they have task access or are assigned to the task
      const task = await this.getTaskById(taskId, userEmail);
      if (!task) {
        return null;
      }

      // Allow if user is assignee or has management permissions
      const hasPermission = await this.checkTaskPermission(taskId, userEmail, ['CREATOR', 'ADMIN', 'TASK_MANAGER']);
      const isAssignee = task.assigneeId === userEmail;

      if (!hasPermission && !isAssignee) {
        return null;
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { 
          status,
          updatedAt: new Date()
        },
        include: {
          milestone: {
            select: {
              id: true,
              name: true
            }
          },
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          }
        }
      });

      return updatedTask;
    } catch (error) {
      console.error('Error in updateTaskStatus:', error);
      throw error;
    }
  }

  // Assign task to user
  async assignTask(taskId, userEmail, userId) {
    try {
      // Check if user has permission to assign tasks
      const hasPermission = await this.checkTaskPermission(taskId, userEmail, ['CREATOR', 'ADMIN', 'TASK_MANAGER']);
      if (!hasPermission) {
        return null;
      }

      // Check if the assignee exists and is a project member
      const task = await this.getTaskById(taskId, userEmail);
      if (!task) {
        return null;
      }

      const projectId = task.milestone.project.id;
      const isProjectMember = await this.checkProjectMembership(projectId, userId);
      if (!isProjectMember) {
        throw new Error('User not a project member');
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { 
          assigneeId: userId,
          updatedAt: new Date()
        },
        include: {
          milestone: {
            select: {
              id: true,
              name: true
            }
          },
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          }
        }
      });

      return updatedTask;
    } catch (error) {
      console.error('Error in assignTask:', error);
      throw error;
    }
  }

  // Unassign task
  async unassignTask(taskId, userEmail) {
    try {
      // Check if user has permission to unassign tasks
      const hasPermission = await this.checkTaskPermission(taskId, userEmail, ['CREATOR', 'ADMIN', 'TASK_MANAGER']);
      if (!hasPermission) {
        return null;
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { 
          assigneeId: null,
          updatedAt: new Date()
        },
        include: {
          milestone: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return updatedTask;
    } catch (error) {
      console.error('Error in unassignTask:', error);
      throw error;
    }
  }

  // Update task priority
  async updateTaskPriority(taskId, userEmail, priority) {
    try {
      // Check if user has permission to update priority
      const hasPermission = await this.checkTaskPermission(taskId, userEmail, ['CREATOR', 'ADMIN', 'TASK_MANAGER']);
      if (!hasPermission) {
        return null;
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { 
          priority,
          updatedAt: new Date()
        },
        include: {
          milestone: {
            select: {
              id: true,
              name: true
            }
          },
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          }
        }
      });

      return updatedTask;
    } catch (error) {
      console.error('Error in updateTaskPriority:', error);
      throw error;
    }
  }

  // Add comment to task
  async addTaskComment(taskId, userEmail, comment) {
    try {
      // Check if user has access to the task
      const task = await this.getTaskById(taskId, userEmail);
      if (!task) {
        return null;
      }

      const taskComment = await prisma.taskComment.create({
        data: {
          content: comment,
          taskId,
          authorId: userEmail
        },
        include: {
          author: {
            select: {
              email: true,
              skillset: true
            }
          }
        }
      });

      return taskComment;
    } catch (error) {
      console.error('Error in addTaskComment:', error);
      throw error;
    }
  }

  // Get task comments
  async getTaskComments(taskId, userEmail) {
    try {
      // Check if user has access to the task
      const task = await this.getTaskById(taskId, userEmail);
      if (!task) {
        return null;
      }

      const comments = await prisma.taskComment.findMany({
        where: { taskId },
        include: {
          author: {
            select: {
              email: true,
              skillset: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return comments;
    } catch (error) {
      console.error('Error in getTaskComments:', error);
      throw error;
    }
  }

  // Update task due date
  async updateTaskDueDate(taskId, userEmail, dueDate) {
    try {
      // Check if user has permission to update due date
      const hasPermission = await this.checkTaskPermission(taskId, userEmail, ['CREATOR', 'ADMIN', 'TASK_MANAGER']);
      if (!hasPermission) {
        return null;
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { 
          dueDate: dueDate ? new Date(dueDate) : null,
          updatedAt: new Date()
        },
        include: {
          milestone: {
            select: {
              id: true,
              name: true
            }
          },
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          }
        }
      });

      return updatedTask;
    } catch (error) {
      console.error('Error in updateTaskDueDate:', error);
      throw error;
    }
  }

  // Get tasks assigned to current user
  async getMyTasks(userEmail, projectId = null) {
    try {
      const whereClause = {
        assigneeId: userEmail
      };

      if (projectId) {
        whereClause.milestone = {
          projectId: projectId
        };
      }

      const tasks = await prisma.task.findMany({
        where: whereClause,
        include: {
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
          },
          creator: {
            select: {
              email: true,
              skillset: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      return tasks;
    } catch (error) {
      console.error('Error in getMyTasks:', error);
      throw error;
    }
  }

  // Get tasks by status
  async getTasksByStatus(userEmail, status, projectId = null) {
    try {
      const whereClause = {
        status,
        milestone: {
          project: {
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
        }
      };

      if (projectId) {
        whereClause.milestone.projectId = projectId;
      }

      const tasks = await prisma.task.findMany({
        where: whereClause,
        include: {
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
          },
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      return tasks;
    } catch (error) {
      console.error('Error in getTasksByStatus:', error);
      throw error;
    }
  }

  // Get overdue tasks
  async getOverdueTasks(userEmail, projectId = null) {
    try {
      const whereClause = {
        dueDate: {
          lt: new Date()
        },
        status: {
          not: 'DONE'
        },
        milestone: {
          project: {
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
        }
      };

      if (projectId) {
        whereClause.milestone.projectId = projectId;
      }

      const tasks = await prisma.task.findMany({
        where: whereClause,
        include: {
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
          },
          assignee: {
            select: {
              email: true,
              skillset: true
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

  // Reorder tasks within a milestone
  async reorderTasks(milestoneId, userEmail, taskIds) {
    try {
      // Check if user has permission to reorder tasks
      const hasPermission = await this.checkMilestonePermission(milestoneId, userEmail, ['CREATOR', 'ADMIN', 'TASK_MANAGER']);
      if (!hasPermission) {
        return null;
      }

      // Update the order of each task
      const updatePromises = taskIds.map((taskId, index) => 
        prisma.task.update({
          where: { id: taskId },
          data: { order: index + 1 }
        })
      );

      await Promise.all(updatePromises);

      // Return the updated tasks
      const tasks = await this.getMilestoneTasks(milestoneId, userEmail);
      return tasks;
    } catch (error) {
      console.error('Error in reorderTasks:', error);
      throw error;
    }
  }

  // Move task to different milestone
  async moveTask(taskId, userEmail, newMilestoneId) {
    try {
      // Check if user has permission for both milestones
      const hasPermissionOld = await this.checkTaskPermission(taskId, userEmail, ['CREATOR', 'ADMIN', 'TASK_MANAGER']);
      const hasPermissionNew = await this.checkMilestonePermission(newMilestoneId, userEmail, ['CREATOR', 'ADMIN', 'TASK_MANAGER']);
      
      if (!hasPermissionOld || !hasPermissionNew) {
        return null;
      }

      // Get the next order number for the new milestone
      const lastTask = await prisma.task.findFirst({
        where: { milestoneId: newMilestoneId },
        orderBy: { order: 'desc' }
      });

      const nextOrder = lastTask ? lastTask.order + 1 : 1;

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { 
          milestoneId: newMilestoneId,
          order: nextOrder,
          updatedAt: new Date()
        },
        include: {
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
          },
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          }
        }
      });

      return updatedTask;
    } catch (error) {
      console.error('Error in moveTask:', error);
      throw error;
    }
  }

  // Bulk update tasks
  async bulkUpdateTasks(userEmail, updates) {
    try {
      const results = [];

      for (const update of updates) {
        try {
          const { taskId, updates: taskUpdates } = update;
          
          // Check permission for each task
          const hasPermission = await this.checkTaskPermission(taskId, userEmail, ['CREATOR', 'ADMIN', 'TASK_MANAGER']);
          if (!hasPermission) {
            results.push({
              taskId,
              success: false,
              error: 'Access denied'
            });
            continue;
          }

          const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
              ...taskUpdates,
              updatedAt: new Date()
            }
          });

          results.push({
            taskId,
            success: true,
            task: updatedTask
          });
        } catch (error) {
          results.push({
            taskId: update.taskId,
            success: false,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error in bulkUpdateTasks:', error);
      throw error;
    }
  }

  // Get all tasks that have just started (status === 'STARTED') and do NOT have a TASK_STARTED notification for the assignee. Optionally filter by projectId. 
  async getStartedTasksWithoutNotification(projectId = null) {
    try {
      // Find all started tasks (adjust status value as per your schema)
      const whereClause = {
        status: 'STARTED',
      };
      if (projectId) {
        whereClause.milestone = { projectId };
      }

      const tasks = await prisma.task.findMany({
        where: whereClause,
        include: {
          assignee: true,
          milestone: { include: { project: true } },
        },
      });

      // Filter out tasks that already have a TASK_STARTED notification for the assignee
      // const filteredTasks = [];
      // for (const task of tasks) {
      //   const existing = await prisma.notification.findFirst({
      //     where: {
      //       type: 'TASK_STARTED',
      //       taskId: task.id,
      //       userId: task.assigneeId,
      //     },
      //   });
      //   if (!existing) {
      //     filteredTasks.push(task);
      //   }
      // }

      return tasks;
    } catch (error) {
      console.error('Error in getStartedTasksWithoutNotification:', error);
      throw error;
    }
  }

  // Get all overdue tasks (dueDate < now, not done) Optionally filter by projectId
  async getOverdueTasksForNotification(projectId = null) {
    try {
      const whereClause = {
        dueDate: { lt: new Date() },
        status: { not: 'COMPLETED' || 'IN_REVIEW' },
      };
      if (projectId) {
        whereClause.milestone = { projectId };
      }
      const tasks = await prisma.task.findMany({
        where: whereClause,
        include: {
          assignee: true,
          milestone: { include: { project: true } },
        },
        orderBy: { dueDate: 'asc' }
      });
      return tasks;
    } catch (error) {
      console.error('Error in getOverdueTasks:', error);
      throw error;
    }
  }

  // Get all tasks due in X days (not done) Optionally filter by projectId
  async getUpcomingTasks(daysUntilDue = 3, projectId = null) {
    try {
      const now = new Date();
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + daysUntilDue);

      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const whereClause = {
        dueDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { not: 'COMPLETED' || 'IN_REVIEW' },
      };
      if (projectId) {
        whereClause.milestone = { projectId };
      }
      const tasks = await prisma.task.findMany({
        where: whereClause,
        include: {
          assignee: true,
          milestone: { include: { project: true } },
        },
        orderBy: { dueDate: 'asc' }
      });
      return tasks;
    } catch (error) {
      console.error('Error in getUpcomingTasks:', error);
      throw error;
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

  // Helper method to check milestone permission
  async checkMilestonePermission(milestoneId, userEmail, allowedRoles) {
    try {
      const milestone = await prisma.milestone.findFirst({
        where: { id: milestoneId },
        include: {
          project: {
            include: {
              members: {
                where: { userId: userEmail }
              }
            }
          }
        }
      });

      if (!milestone) return false;

      // Check if user is creator
      if (allowedRoles.includes('CREATOR') && milestone.project.creatorId === userEmail) {
        return true;
      }

      // Check if user is member with required role
      if (milestone.project.members.length > 0) {
        const memberRole = milestone.project.members[0].role;
        return allowedRoles.includes(memberRole);
      }

      return false;
    } catch (error) {
      console.error('Error in checkMilestonePermission:', error);
      return false;
    }
  }

  // Helper method to check task permission
  async checkTaskPermission(taskId, userEmail, allowedRoles) {
    try {
      const task = await prisma.task.findFirst({
        where: { id: taskId },
        include: {
          milestone: {
            include: {
              project: {
                include: {
                  members: {
                    where: { userId: userEmail }
                  }
                }
              }
            }
          }
        }
      });

      if (!task) return false;

      const project = task.milestone.project;

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
      console.error('Error in checkTaskPermission:', error);
      return false;
    }
  }

  // Helper method to check project membership
  async checkProjectMembership(projectId, userEmail) {
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
      console.error('Error in checkProjectMembership:', error);
      return false;
    }
  }
 

}

module.exports = new TaskService();