// src/lib/prisma.js - CommonJS version
const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient();

// Add the middleware for cascading updates
prisma.$use(async (params, next) => {
  const result = await next(params);
  
  // Handle task status changes
  if (params.model === 'Task' && ['update', 'updateMany', 'create', 'delete'].includes(params.action)) {
    await handleTaskStatusChange(params, result);
  }
  
  // Handle milestone status changes
  if (params.model === 'Milestone' && ['update', 'updateMany'].includes(params.action)) {
    await handleMilestoneStatusChange(params, result);
  }
  
  return result;
});

async function handleTaskStatusChange(params, result) {
  try {
    let milestoneIds = [];
    
    // Get milestone IDs affected by the change
    if (params.action === 'update' && params.args.where?.id) {
      const task = await prisma.task.findUnique({
        where: { id: params.args.where.id },
        select: { milestoneId: true }
      });
      if (task) milestoneIds.push(task.milestoneId);
    } else if (params.action === 'create' && result?.milestoneId) {
      milestoneIds.push(result.milestoneId);
    }
    
    // Update milestone statuses
    for (const milestoneId of milestoneIds) {
      await updateMilestoneStatus(milestoneId);
    }
  } catch (error) {
    console.error('Error in task status change handler:', error);
  }
}

async function handleMilestoneStatusChange(params, result) {
  try {
    let projectIds = [];
    
    if (params.action === 'update' && params.args.where?.id) {
      const milestone = await prisma.milestone.findUnique({
        where: { id: params.args.where.id },
        select: { projectId: true }
      });
      if (milestone) projectIds.push(milestone.projectId);
    }
    
    // Update project statuses
    for (const projectId of projectIds) {
      await updateProjectStatus(projectId);
    }
  } catch (error) {
    console.error('Error in milestone status change handler:', error);
  }
}

async function updateMilestoneStatus(milestoneId) {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      tasks: {
        select: { status: true }
      }
    }
  });
  
  if (!milestone) return;
  
  const totalTasks = milestone.tasks.length;
  if (totalTasks === 0) return;
  
  const completedTasks = milestone.tasks.filter(task => task.status === 'COMPLETED').length;
  const inProgressTasks = milestone.tasks.filter(task => task.status === 'IN_PROGRESS').length;
  const overdueTasks = milestone.tasks.filter(task => task.status === 'OVERDUE').length;
  
  let newStatus = milestone.status;
  
  if (completedTasks === totalTasks) {
    newStatus = 'COMPLETED';
  } else if (overdueTasks > 0) {
    newStatus = 'OVERDUE';
  } else if (inProgressTasks > 0) {
    newStatus = 'IN_PROGRESS';
  }
  
  if (newStatus !== milestone.status) {
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: { 
        status: newStatus,
        updatedAt: new Date()
      }
    });
    
    // Trigger project update
    await updateProjectStatus(milestone.projectId);
  }
}

async function updateProjectStatus(projectId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      milestones: {
        select: { status: true }
      }
    }
  });
  
  if (!project) return;
  
  const totalMilestones = project.milestones.length;
  if (totalMilestones === 0) return;
  
  const completedMilestones = project.milestones.filter(m => m.status === 'COMPLETED').length;
  const inProgressMilestones = project.milestones.filter(m => m.status === 'IN_PROGRESS').length;
  
  let newStatus = project.status;
  
  if (completedMilestones === totalMilestones) {
    newStatus = 'COMPLETED';
  } else if (inProgressMilestones > 0) {
    newStatus = 'ACTIVE';
  }
  
  if (newStatus !== project.status) {
    await prisma.project.update({
      where: { id: projectId },
      data: { 
        status: newStatus,
        updatedAt: new Date()
      }
    });
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = prisma;