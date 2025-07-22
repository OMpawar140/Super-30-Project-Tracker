const { PrismaClient } = require('@prisma/client');
const NotificationTriggers = require('../utils/notificationTriggers');
const prisma = new PrismaClient();

class TaskService {
  // Get all tasks for a milestone
  async getMilestoneTasks(milestoneId, userEmail) {
    try {
      // Use dedicated permission checking method for better role-based access control
      const hasPermission = await this.checkMilestonePermission(
        milestoneId, 
        userEmail, 
        ['CREATOR', 'ADMIN', 'TASK_COMPLETER', 'VIEWER']
      );
      
      if (!hasPermission) {
        return null;
      }

      const tasks = await prisma.task.findMany({
        where: { milestoneId },
        include: {
          // Task assignee information
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          },
          // Task creator information
          creator: {
            select: {
              email: true,
              skillset: true
            }
          },
          // Milestone and project context for better hierarchy understanding
          milestone: {
            select: {
              id: true,
              name: true,
              dueDate: true,
              status: true,
              project: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                  creator: {
                    select: {
                      email: true,
                      skillset: true
                    }
                  }
                }
              }
            }
          },
          // Complete comment information with author details
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
          // Comment count for quick reference
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: [
          // Priority-based ordering (high priority first)
          { priority: 'desc' },
          // Due date ordering (urgent tasks first)
          { dueDate: 'asc' },
          // Fallback to custom order if available
          { order: 'asc' },
          // Final fallback to creation time
          { createdAt: 'asc' }
        ]
      });

      // Optional: Transform data to include computed fields
      const enrichedTasks = tasks.map(task => ({
        ...task,
        // Add computed fields for better client-side handling
        isOverdue: task.dueDate && new Date(task.dueDate) < new Date(),
        hasComments: task._count.comments > 0,
        projectContext: {
          projectId: task.milestone.project.id,
          projectName: task.milestone.project.name,
          projectStatus: task.milestone.project.status,
          milestoneName: task.milestone.name,
          milestoneStatus: task.milestone.status
        }
      }));

      return enrichedTasks;
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

  // Get task by ID with comprehensive details and proper permission checking
  async getTaskById(taskId, userEmail) {
    try {
      // Use dedicated permission checking method for better role-based access control
      const hasPermission = await this.checkTaskPermission(
        taskId, 
        userEmail, 
        ['CREATOR', 'ADMIN', 'TASK_COMPLETER', 'MEMBER', 'VIEWER']
      );
      
      if (!hasPermission) {
        return null;
      }

      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          // Task assignee information
          assignee: {
            select: {
              email: true,
              skillset: true,
            }
          },
          // Task reviews (for task completers to see feedback)
          reviews: {
            include: {
              reviewer: {
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
          // Complete milestone and project hierarchy
          milestone: {
            select: {
              id: true,
              name: true,
              description: true,
              endDate: true,
              status: true,
              project: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  status: true,
                  creator: {
                    select: {
                      email: true,
                      skillset: true,
                    }
                  }
                }
              }
            }
          },
          // Task comments with full author details
          // comments: {
          //   include: {
          //     author: {
          //       select: {
          //         email: true,
          //         skillset: true,
          //       }
          //     }
          //   },
          //   orderBy: {
          //     createdAt: 'desc'
          //   }
          // },
          // Task dependencies (if any)
          // dependencies: {
          //   select: {
          //     id: true,
          //     title: true,
          //     status: true,
          //     priority: true
          //   }
          // },
          // // Tasks that depend on this task
          // dependents: {
          //   select: {
          //     id: true,
          //     title: true,
          //     status: true,
          //     priority: true
          //   }
          // },
          // Comment count for quick reference
          // _count: {
          //   select: {
          //     comments: true,
          //     dependencies: true,
          //     dependents: true
          //   }
          // }
        }
      });

      if (!task) {
        return null;
      }

      // Enrich task data with computed fields for better client-side handling
      const enrichedTask = {
        ...task,
        // Computed status fields
        isOverdue: task.dueDate && new Date(task.dueDate) < new Date(),
        isAssignedToCurrentUser: task.assignee?.email === userEmail,
        isCreatedByCurrentUser: task.creator?.email === userEmail,
        
        // Quick access flags
        // hasComments: task._count.comments > 0,
        // hasDependencies: task._count.dependencies > 0,
        // hasDependents: task._count.dependents > 0,
        
        // Contextual information
        projectContext: {
          projectId: task.milestone.project.id,
          projectName: task.milestone.project.name,
          projectStatus: task.milestone.project.status,
          projectCreator: task.milestone.project.creator,
          milestoneId: task.milestone.id,
          milestoneName: task.milestone.name,
          milestoneStatus: task.milestone.status,
          milestoneEndDate: task.milestone.endDate
        },
        
        // Permission context for UI rendering
        userPermissions: {
          canEdit: ['CREATOR', 'ADMIN'].some(role => 
            this.checkTaskPermission(taskId, userEmail, [role])
          ),
          canComment: ['CREATOR', 'ADMIN', 'TASK_COMPLETER', 'MEMBER'].some(role => 
            this.checkTaskPermission(taskId, userEmail, [role])
          ),
          canAssign: ['CREATOR', 'ADMIN'].some(role => 
            this.checkTaskPermission(taskId, userEmail, [role])
          ),
          canViewReviews: task.assignee?.email === userEmail || ['CREATOR', 'ADMIN'].some(role => 
            this.checkTaskPermission(taskId, userEmail, [role])
          )
        }
      };

      return enrichedTask;
    } catch (error) {
      console.error('Error in getTaskById:', error);
      throw error;
    }
  }

  // Get task reviews (for task completer to see feedback)
  async getTaskReviews(taskId, userEmail) {
    try {
      // Check if user has permission to view reviews
      // Task assignee can view reviews of their task, creators/admins can view all reviews
      const hasPermission = await this.checkTaskPermission(
        taskId, 
        userEmail, 
        ['CREATOR', 'ADMIN', 'TASK_COMPLETER']
      );
      
      if (!hasPermission) {
        return null;
      }

      // Additional check: if user is task completer, ensure they are assigned to this task
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: {
          assigneeId: true,
          assignee: {
            select: {
              email: true
            }
          }
        }
      });

      if (!task) {
        return null;
      }

      // If user is not creator/admin, they must be the assignee to view reviews
      const isCreatorOrAdmin = await this.checkTaskPermission(taskId, userEmail, ['CREATOR', 'ADMIN']);
      if (!isCreatorOrAdmin && task.assignee?.email !== userEmail) {
        return null;
      }

      const reviews = await prisma.taskReview.findMany({
        where: { taskId },
        include: {
          reviewer: {
            select: {
              email: true,
              skillset: true
            }
          },
          task: {
            select: {
              id: true,
              title: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return reviews;
    } catch (error) {
      console.error('Error in getTaskReviews:', error);
      throw error;
    }
  }

  // Create new task
async createTask(milestoneId, userEmail, taskData) {
  try {
    console.log(`[createTask] Start: userEmail=${userEmail}, milestoneId=${milestoneId}, taskData=`, taskData);

    // Check if user has permission
    const hasPermission = await this.checkMilestonePermission(
      milestoneId,
      userEmail,
      ['CREATOR', 'ADMIN', 'TASK_MANAGER']
    );
    console.log(`[createTask] Permission Check: ${hasPermission}`);

    if (!hasPermission) {
      console.warn('[createTask] User does not have permission to create tasks');
      return null;
    }

    // Validate assignee existence
    if (taskData.assigneeId) {
      console.log(`[createTask] Validating assigneeId: ${taskData.assigneeId}`);
      const assigneeExists = await prisma.user.findUnique({
        where: { id: taskData.assigneeId }
      });
      if (!assigneeExists) {
        console.error('[createTask] Assigned user not found');
        throw new Error('Assigned user not found');
      }
    }

    // Get last task in milestone to determine next order
    const lastTask = await prisma.task.findFirst({
      where: { milestoneId },
      orderBy: { order: 'desc' }
    });
    const nextOrder = lastTask ? lastTask.order + 1 : 1;
    console.log(`[createTask] Calculated next task order: ${nextOrder}`);

    // Create the task
    const task = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description || null,
        status: taskData.status || 'TODO',
        priority: taskData.priority || 'MEDIUM',
        startDate: taskData.startDate ? new Date(taskData.startDate) : null,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        estimatedHours: taskData.estimatedHours || null,
        assigneeId: taskData.assigneeId || null,
        milestoneId,
        createdBy: userEmail,
        order: nextOrder,
        tags: taskData.tags || []
      },
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

    console.log('[createTask] Task created successfully:', task.id);
    return task;

  } catch (error) {
    console.error('[createTask] Error:', error);
    throw error;
  }
}


  // Update existing task
  async updateTask(taskId, userEmail, updateData) {
    try {
      // Dynamic permission checking - allow task completers for status updates
      const allowedRoles = updateData.status ? 
        ['CREATOR', 'ADMIN', 'TASK_COMPLETER'] : 
        ['CREATOR', 'ADMIN'];
      
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
          ...(updateData.status && { status: updateData.status }),
          ...(updateData.priority && { priority: updateData.priority }),
          ...(updateData.startDate !== undefined && { 
            startDate: updateData.startDate ? new Date(updateData.startDate) : null 
          }),
          ...(updateData.dueDate !== undefined && { 
            dueDate: updateData.dueDate ? new Date(updateData.dueDate) : null 
          }),
          ...(updateData.estimatedHours !== undefined && { estimatedHours: updateData.estimatedHours }),
          ...(updateData.actualHours !== undefined && { actualHours: updateData.actualHours }),
          ...(updateData.assigneeId !== undefined && { assigneeId: updateData.assigneeId }),
          ...(updateData.tags && { tags: updateData.tags }),
          updatedAt: new Date()
        },
        include: {
          assignee: {
            select: {
              email: true,
              skillset: true
            }
          },
          // creator: {
          //   select: {
          //     email: true,
          //     skillset: true
          //   }
          // },
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

  // Delete task
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

  // Submit task review
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
          },
          assignee: {
            select: {
              email: true
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

      // Update task status based on review status
      const taskUpdateData = {};
      if (reviewData.status === 'APPROVED') {
        taskUpdateData.status = 'COMPLETED';
      } else if (reviewData.status === 'REJECTED') {
        taskUpdateData.status = 'IN_PROGRESS'; // Send back to in progress for rework
      }

      // Create review and update task in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create the review
        const taskReview = await tx.taskReview.create({
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

        // Update task status if needed
        if (Object.keys(taskUpdateData).length > 0) {
          await tx.task.update({
            where: { id: taskId },
            data: {
              ...taskUpdateData,
              updatedAt: new Date()
            }
          });
        }

        return taskReview;
      });
      // Send notification to task assignee about review completion
      try {
        console.log(taskReview);
        await NotificationTriggers.taskReviewCompleted(taskReview.task, {
          id: taskReview.id,
          status: taskReview.status,
          comment: taskReview.comment,
          reviewerId: taskReview.reviewerId
        });
        console.log(`Notification sent for task review: ${taskReview.task.title} - ${taskReview.status}`);
      } catch (notificationError) {
        console.error('Failed to send task review notification:', notificationError);
      }

      return result;
      
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
      const hasPermission = await this.checkTaskPermission(taskId, userEmail, [
        "CREATOR",
        "ADMIN",
        "TASK_MANAGER",
      ]);
      const isAssignee = task.assigneeId === userEmail;

      if (!hasPermission && !isAssignee) {
        return null;
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          status,
          updatedAt: new Date(),
        },
        include: {
          milestone: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  members: {
                    where: {
                      role: {
                        in: ["CREATOR", "ADMIN"],
                      },
                    },
                    select: {
                      userId: true,
                    },
                  },
                },
              },
            },
          },
          assignee: {
            select: {
              email: true,
              skillset: true,
            },
          },
        },
      });

      // Trigger notification when task is submitted for review
      if (status === "IN_REVIEW") {
        try {
          const reviewerEmails = updatedTask.milestone.project.members
            .map((member) => member.userId)
            .filter((email) => email !== userEmail); 

          if (reviewerEmails.length > 0) {
            await NotificationTriggers.taskReviewRequested(
              updatedTask,
              reviewerEmails
            );
            console.log(
              `Review request notifications sent for task: ${updatedTask.title}`
            );
          }
        } catch (notificationError) {
          console.error(
            "Failed to send task review request notification:",
            notificationError
          );
          // Don't throw - task status was updated successfully, notification failure shouldn't break the flow
        }
      }

      return updatedTask;
    } catch (error) {
      console.error("Error in updateTaskStatus:", error);
      throw error;
    }
  }


  // Assign task to user
  async assignTask(taskId, userEmail, assigneeId) {
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
      const isProjectMember = await this.checkProjectMembership(projectId, assigneeId);
      if (!isProjectMember) {
        throw new Error('User not a project member');
      }

      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { 
          assigneeId: assigneeId,
          updatedAt: new Date()
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

      return updatedTask;
    } catch (error) {
      console.error('Error in assignTask:', error);
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
  async getTasksByStatus(userEmail, status, milestoneId = null, projectId = null) {
    try {
      // If milestoneId is provided, check milestone permission
      if (milestoneId) {
        const hasPermission = await this.checkMilestonePermission(milestoneId, userEmail, ['CREATOR', 'ADMIN', 'MEMBER']);
        if (!hasPermission) {
          return null;
        }
      }

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

      // Add milestone filter if specified
      if (milestoneId) {
        whereClause.milestoneId = milestoneId;
      }

      // Add project filter if specified
      if (projectId) {
        whereClause.milestone.project.id = projectId;
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
  async getOverdueTasks(userEmail, projectId = null, milestoneId = null) {
    try {
      let whereClause;
      let hasPermission = true;

      if (milestoneId) {
        // Check if user has permission to view milestone tasks
        hasPermission = await this.checkMilestonePermission(milestoneId, userEmail, ['CREATOR', 'ADMIN', 'MEMBER']);
        if (!hasPermission) {
          return null;
        }

        whereClause = {
          milestoneId: milestoneId,
          dueDate: {
            lt: new Date()
          },
          status: {
            not: 'COMPLETED'
          }
        };
      } else {
        whereClause = {
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
  async checkMilestonePermission(milestoneId, userEmail, allowedRoles = ['CREATOR', 'ADMIN']) {
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
      if (allowedRoles.includes('CREATOR') && project.creator.email === userEmail) {
        return true;
      }

      // Check if user is admin member
      if (allowedRoles.includes('ADMIN')) {
        const adminMember = project.members.find(
          member => member.user.email === userEmail && member.role === 'ADMIN'
        );
        if (adminMember) return true;
      }

      // Check if user is regular member (for read operations)
      if (allowedRoles.includes('MEMBER')) {
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
  
  // Helper method to check task permission
  async checkTaskPermission(taskId, userEmail, allowedRoles = ['CREATOR', 'ADMIN']) {
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
      if (allowedRoles.includes('CREATOR') && project.creator.email === userEmail) {
        return true;
      }

      // Check if user is admin member
      if (allowedRoles.includes('ADMIN')) {
        const adminMember = project.members.find(
          member => member.user.email === userEmail && member.role === 'ADMIN'
        );
        if (adminMember) return true;
      }

      // Check if user is task assignee (for task completion and viewing)
      if (allowedRoles.includes('TASK_COMPLETER') && task.assignee && task.assignee.email === userEmail) {
        return true;
      }

      // Check if user is regular member (for read operations)
      if (allowedRoles.includes('MEMBER')) {
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

  // Get task files (for file management)
  async getTaskFiles(taskId, userEmail) {
    try {
      // Check if user has permission to view task files
      const hasPermission = await this.checkTaskPermission(
        taskId, 
        userEmail, 
        ['CREATOR', 'ADMIN', 'TASK_COMPLETER']
      );
      
      if (!hasPermission) {
        return null;
      }

      // Additional check: if user is task completer, ensure they are assigned to this task
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        select: {
          assigneeId: true,
          assignee: {
            select: {
              email: true
            }
          },
          milestone: {
            select: {
              project: {
                select: {
                  creatorId: true
                }
              }
            }
          }
        }
      });

      if (!task) {
        return null;
      }

      // If user is not creator/admin, they must be the assignee to view files
      const isCreatorOrAdmin = await this.checkTaskPermission(taskId, userEmail, ['CREATOR', 'ADMIN']);
      if (!isCreatorOrAdmin && task.assignee?.email !== userEmail) {
        return null;
      }

      // Return task info for file service integration
      return {
        taskId,
        hasAccess: true,
        isAssignee: task.assignee?.email === userEmail,
        isCreator: task.milestone.project.creatorId === userEmail
      };
    } catch (error) {
      console.error('Error in getTaskFiles:', error);
      throw error;
    }
  }
}

module.exports = new TaskService();