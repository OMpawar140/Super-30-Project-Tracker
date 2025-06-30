// src/services/statusUpdateService.js
const { PrismaClient } = require('@prisma/client');
const cron = require('node-cron');

const prisma = new PrismaClient();

// Status update service
class statusUpdateService {
  // Update tasks based on dates
  static async updateTaskStatuses() {
    const now = new Date();
    
    try {
      // Update tasks to IN_PROGRESS when start date arrives
      const tasksToStart = await prisma.task.updateMany({
        where: {
          startDate: { lte: now },
          status: 'UPCOMING'
        },
        data: {
          status: 'IN_PROGRESS',
          updatedAt: now
        }
      });

      // Update overdue tasks
      const overdueTasks = await prisma.task.updateMany({
        where: {
          dueDate: { lt: now },
          status: { notIn: ['COMPLETED', 'OVERDUE'] }
        },
        data: {
          status: 'OVERDUE',
          updatedAt: now
        }
      });

      console.log(`Updated ${tasksToStart.count} tasks to IN_PROGRESS`);
      console.log(`Updated ${overdueTasks.count} tasks to OVERDUE`);

      // Trigger milestone updates after task changes
      await this.updateMilestoneStatuses();
      
    } catch (error) {
      console.error('Error updating task statuses:', error);
    }
  }

  // Update milestones based on dates and task completion
  static async updateMilestoneStatuses() {
    const now = new Date();
    
    try {
      // Update milestones to IN_PROGRESS when start date arrives
      await prisma.milestone.updateMany({
        where: {
          startDate: { lte: now },
          status: 'PLANNED'
        },
        data: {
          status: 'IN_PROGRESS',
          updatedAt: now
        }
      });

      // Update overdue milestones
      await prisma.milestone.updateMany({
        where: {
          endDate: { lt: now },
          status: { notIn: ['COMPLETED', 'OVERDUE'] }
        },
        data: {
          status: 'OVERDUE',
          updatedAt: now
        }
      });

      // Update milestone completion based on task completion
      const milestones = await prisma.milestone.findMany({
        include: {
          tasks: {
            select: { status: true }
          }
        }
      });

      for (const milestone of milestones) {
        const totalTasks = milestone.tasks.length;
        const completedTasks = milestone.tasks.filter(task => task.status === 'COMPLETED').length;
        const inProgressTasks = milestone.tasks.filter(task => task.status === 'IN_PROGRESS').length;
        const overdueTasks = milestone.tasks.filter(task => task.status === 'OVERDUE').length;

        let newStatus = milestone.status;

        if (totalTasks > 0) {
          if (completedTasks === totalTasks) {
            newStatus = 'COMPLETED';
          } else if (inProgressTasks > 0) {
            newStatus = 'IN_PROGRESS';
          } else if (overdueTasks > 0) {
            newStatus = 'OVERDUE';
          }
        }

        if (newStatus !== milestone.status) {
          await prisma.milestone.update({
            where: { id: milestone.id },
            data: { 
              status: newStatus,
              updatedAt: now
            }
          });
        }
      }

      // Trigger project updates after milestone changes
      await this.updateProjectStatuses();
      
    } catch (error) {
      console.error('Error updating milestone statuses:', error);
    }
  }

  // Update projects based on milestone completion
  static async updateProjectStatuses() {
    const now = new Date();
    
    try {
      const projects = await prisma.project.findMany({
        include: {
          milestones: {
            select: { status: true }
          }
        }
      });

      for (const project of projects) {
        const totalMilestones = project.milestones.length;
        const completedMilestones = project.milestones.filter(m => m.status === 'COMPLETED').length;
        const inProgressMilestones = project.milestones.filter(m => m.status === 'IN_PROGRESS').length;

        let newStatus = project.status;

        if (totalMilestones > 0) {
          if (completedMilestones === totalMilestones) {
            newStatus = 'COMPLETED';
          } else if (inProgressMilestones > 0) {
            newStatus = 'ACTIVE';
          }
        }

        if (newStatus !== project.status) {
          await prisma.project.update({
            where: { id: project.id },
            data: { 
              status: newStatus,
              updatedAt: now
            }
          });
        }
      }
      
    } catch (error) {
      console.error('Error updating project statuses:', error);
    }
  }

  // Archive project (soft delete with 7-day retention)
  async archiveProject(projectId) {
    const now = new Date();
    
    try {
      // First check if project exists and is not already archived
      const existingProject = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!existingProject) {
        throw new Error('Project not found');
      }

      if (existingProject.status === 'ARCHIVED') {
        throw new Error('Project is already archived');
      }

      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'ARCHIVED',
          updatedAt: now
        }
      });

      const deleteAfter = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
      console.log(`Project ${projectId} archived. Will be deleted after ${deleteAfter.toISOString()}`);
      return updatedProject;
      
    } catch (error) {
      console.error('Error archiving project:', error);
      throw error;
    }
  }

  // Restore archived project
  async restoreProject(projectId) {
    const now = new Date();
    
    try {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        throw new Error('Project not found');
      }

      if (project.status !== 'ARCHIVED') {
        throw new Error('Project is not archived');
      }

      // Check if the project is still within the restoration period (7 days from updatedAt)
      const archiveDate = new Date(project.updatedAt);
      const expirationDate = new Date(archiveDate.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      if (now > expirationDate) {
        throw new Error('Project restoration period has expired');
      }

      const restoredProject = await prisma.project.update({
        where: { id: projectId },
        data: {
          status: 'ACTIVE',
          updatedAt: now
        }
      });

      console.log(`Project ${projectId} restored successfully`);
      return restoredProject;
      
    } catch (error) {
      console.error('Error restoring project:', error);
      throw error;
    }
  }

  // Clean up expired archived projects
  static async cleanupExpiredProjects() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    try {
      // Find projects that are archived and were archived more than 7 days ago
      const expiredProjects = await prisma.project.findMany({
        where: {
          status: 'ARCHIVED',
          updatedAt: { lt: sevenDaysAgo }
        },
        include: {
          milestones: {
            include: {
              tasks: true
            }
          }
        }
      });

      console.log(`Found ${expiredProjects.length} expired projects to delete`);

      for (const project of expiredProjects) {
        // Delete all tasks associated with the project's milestones
        for (const milestone of project.milestones) {
          await prisma.task.deleteMany({
            where: { milestoneId: milestone.id }
          });
        }

        // Delete all milestones associated with the project
        await prisma.milestone.deleteMany({
          where: { projectId: project.id }
        });

        // Finally, delete the project
        await prisma.project.delete({
          where: { id: project.id }
        });

        console.log(`Permanently deleted expired project: ${project.id} - ${project.name}`);
      }

      if (expiredProjects.length > 0) {
        console.log(`Cleanup completed: ${expiredProjects.length} expired projects permanently deleted`);
      }
      
    } catch (error) {
      console.error('Error during cleanup of expired projects:', error);
    }
  }

  // Get archived projects that can still be restored
  async getRestorableProjects() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    try {
      const restorableProjects = await prisma.project.findMany({
        where: {
          status: 'ARCHIVED',
          updatedAt: { gt: sevenDaysAgo } // Only projects archived within the last 7 days
        },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          updatedAt: true
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      // Add expiration date and days remaining for each project
      const projectsWithExpiration = restorableProjects.map(project => {
        const archiveDate = new Date(project.updatedAt);
        const expirationDate = new Date(archiveDate.getTime() + (7 * 24 * 60 * 60 * 1000));
        const daysRemaining = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
        
        return {
          ...project,
          archivedAt: project.updatedAt,
          expirationDate,
          daysRemaining: Math.max(0, daysRemaining)
        };
      });

      return projectsWithExpiration;
      
    } catch (error) {
      console.error('Error fetching restorable projects:', error);
      throw error;
    }
  }

  // Main update function
  static async updateAllStatuses() {
    console.log('Starting scheduled status update...');
    await this.updateTaskStatuses();
    await this.cleanupExpiredProjects();
    console.log('Status update completed');
  }
}

// Schedule the job to run every hour
cron.schedule('0 * * * *', () => {
  StatusUpdateService.updateAllStatuses();
});

// Also run every 15 minutes during business hours for more responsive updates
cron.schedule('*/15 9-18 * * 1-5', () => {
  StatusUpdateService.updateAllStatuses();
});

// Run cleanup daily at 2 AM to remove expired archived projects
cron.schedule('0 2 * * *', () => {
  console.log('Running daily cleanup of expired projects...');
  StatusUpdateService.cleanupExpiredProjects();
});

// Run once at startup
statusUpdateService.updateAllStatuses();

console.log('Status update service started with cron jobs');

module.exports = new statusUpdateService();