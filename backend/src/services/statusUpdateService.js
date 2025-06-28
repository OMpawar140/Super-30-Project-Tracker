// src/services/statusUpdateService.js - CommonJS version
const { PrismaClient } = require('@prisma/client');
const cron = require('node-cron');

const prisma = new PrismaClient();

// Status update service
class StatusUpdateService {
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

  // Main update function
  static async updateAllStatuses() {
    console.log('Starting scheduled status update...');
    await this.updateTaskStatuses();
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

// Run once at startup
StatusUpdateService.updateAllStatuses();

console.log('Status update service started with cron jobs');

module.exports = StatusUpdateService;