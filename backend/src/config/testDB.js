const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedNotifications() {
  try {
    console.log('🌱 Starting notification seeding...');

    // 1. First, create demo users
    console.log('Creating demo users...');
    
    const users = [
      {
        email: 'ompawar2324@gmail.com',
        skillset: 'Full Stack Development, React, Node.js'
      },
      {
        email: 'john.creator@example.com',
        skillset: 'Project Management, JavaScript, React'
      },
      {
        email: 'jane.dev@example.com',
        skillset: 'Frontend Development, Vue.js, CSS'
      },
      {
        email: 'mike.backend@example.com',
        skillset: 'Backend Development, Python, Django'
      }
    ];

    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user
      });
    }
    console.log('✅ Users created');

    // 2. Create demo project
    console.log('Creating demo project...');
    
    const project = await prisma.project.upsert({
      where: { id: 'project_demo_001' },
      update: {},
      create: {
        id: 'project_demo_001',
        name: 'E-commerce Platform',
        description: 'A modern e-commerce platform with React frontend and Node.js backend',
        status: 'ACTIVE',
        creatorId: 'john.creator@example.com',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
      }
    });
    console.log('✅ Project created');

    // 3. Add project members
    console.log('Adding project members...');
    
    const projectMembers = [
      {
        id: 'member_001',
        userId: 'ompawar2324@gmail.com',
        projectId: 'project_demo_001',
        role: 'TASK_COMPLETER'
      },
      {
        id: 'member_002',
        userId: 'jane.dev@example.com',
        projectId: 'project_demo_001',
        role: 'TASK_COMPLETER'
      },
      {
        id: 'member_003',
        userId: 'mike.backend@example.com',
        projectId: 'project_demo_001',
        role: 'ADMIN'
      }
    ];

    for (const member of projectMembers) {
      await prisma.projectMember.upsert({
        where: { 
          userId_projectId: {
            userId: member.userId,
            projectId: member.projectId
          }
        },
        update: {},
        create: member
      });
    }
    console.log('✅ Project members added');

    // 4. Create demo milestone
    console.log('Creating demo milestone...');
    
    const milestone = await prisma.milestone.upsert({
      where: { id: 'milestone_001' },
      update: {},
      create: {
        id: 'milestone_001',
        name: 'Frontend Development Phase',
        description: 'Complete the frontend user interface and user experience',
        status: 'IN_PROGRESS',
        projectId: 'project_demo_001',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    });
    console.log('✅ Milestone created');

    // 5. Create demo tasks
    console.log('Creating demo tasks...');
    
    const tasks = [
      {
        id: 'task_001',
        title: 'Create Product Catalog Page',
        description: 'Design and implement the product catalog with search and filter functionality',
        priority: 'HIGH',
        status: 'IN_REVIEW',
        milestoneId: 'milestone_001',
        assigneeId: 'ompawar2324@gmail.com',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      {
        id: 'task_002',
        title: 'Implement User Authentication',
        description: 'Build login, register, and password reset functionality',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        milestoneId: 'milestone_001',
        assigneeId: 'jane.dev@example.com',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      }
    ];

    for (const task of tasks) {
      await prisma.task.upsert({
        where: { id: task.id },
        update: {},
        create: task
      });
    }
    console.log('✅ Tasks created');

    // 6. Create demo task reviews
    console.log('Creating demo task reviews...');
    
    const taskReviews = [
      {
        id: 'review_001',
        status: 'PENDING',
        comment: 'Please review the product catalog implementation. Check the search functionality.',
        taskId: 'task_001',
        reviewerId: 'john.creator@example.com'
      },
      {
        id: 'review_002',
        status: 'APPROVED',
        comment: 'Excellent work on the authentication system!',
        taskId: 'task_002',
        reviewerId: 'mike.backend@example.com'
      }
    ];

    for (const review of taskReviews) {
      await prisma.taskReview.upsert({
        where: { id: review.id },
        update: {},
        create: review
      });
    }
    console.log('✅ Task reviews created');

    // 7. Finally, create demo notifications
    console.log('Creating demo notifications...');
    
    const notifications = [
      // Notification for ompawar2324@gmail.com - Project member added
      {
        id: 'notif_001',
        type: 'PROJECT_MEMBER_ADDED',
        title: 'Added to Project',
        message: 'You have been added to "E-commerce Platform"',
        isRead: false,
        userId: 'ompawar2324@gmail.com',
        projectId: 'project_demo_001',
        metadata: {
          projectName: 'E-commerce Platform',
          addedBy: 'john.creator@example.com'
        }
      },

      // Notification for ompawar2324@gmail.com - Task review requested
      {
        id: 'notif_002',
        type: 'TASK_REVIEW_REQUESTED',
        title: 'Review Required',
        message: '"Create Product Catalog Page" is ready for review',
        isRead: false,
        userId: 'john.creator@example.com',
        projectId: 'project_demo_001',
        taskId: 'task_001',
        metadata: {
          taskTitle: 'Create Product Catalog Page',
          submittedBy: 'ompawar2324@gmail.com',
          projectName: 'E-commerce Platform'
        }
      },

      // Notification for ompawar2324@gmail.com - Task started
      {
        id: 'notif_003',
        type: 'TASK_STARTED',
        title: 'Task Started',
        message: '"Create Product Catalog Page" has been started',
        isRead: true,
        userId: 'john.creator@example.com',
        projectId: 'project_demo_001',
        taskId: 'task_001',
        metadata: {
          taskTitle: 'Create Product Catalog Page',
          startedBy: 'ompawar2324@gmail.com',
          projectName: 'E-commerce Platform'
        }
      },

      // Notification for ompawar2324@gmail.com - Task due reminder
      {
        id: 'notif_004',
        type: 'TASK_DUE_REMINDER',
        title: 'Task Due Soon',
        message: '"Create Product Catalog Page" is due in 3 day(s)',
        isRead: false,
        userId: 'ompawar2324@gmail.com',
        projectId: 'project_demo_001',
        taskId: 'task_001',
        metadata: {
          taskTitle: 'Create Product Catalog Page',
          daysUntilDue: 3,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          projectName: 'E-commerce Platform'
        }
      },

      // Notification for ompawar2324@gmail.com - Task overdue
      {
        id: 'notif_005',
        type: 'TASK_OVERDUE',
        title: 'Task Overdue',
        message: '"Create Product Catalog Page" is now 1 day(s) overdue',
        isRead: false,
        userId: 'ompawar2324@gmail.com',
        projectId: 'project_demo_001',
        taskId: 'task_001',
        metadata: {
          taskTitle: 'Create Product Catalog Page',
          daysPastDue: 1,
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          projectName: 'E-commerce Platform'
        }
      },

      // Notification for jane.dev@example.com - Task approved
      {
        id: 'notif_006',
        type: 'TASK_APPROVED',
        title: 'Task APPROVED',
        message: 'Your task "Implement User Authentication" has been approved: Excellent work on the authentication system!',
        isRead: false,
        userId: 'jane.dev@example.com',
        projectId: 'project_demo_001',
        taskId: 'task_002',
        taskReviewId: 'review_002',
        metadata: {
          taskTitle: 'Implement User Authentication',
          reviewComment: 'Excellent work on the authentication system!',
          reviewedBy: 'mike.backend@example.com'
        }
      },

      // Additional notifications for ompawar2324@gmail.com
      {
        id: 'notif_007',
        type: 'TASK_REJECTED',
        title: 'Task REJECTED',
        message: 'Your task "Create Product Catalog Page" has been rejected: Please add more filtering options and improve the search functionality',
        isRead: false,
        userId: 'ompawar2324@gmail.com',
        projectId: 'project_demo_001',
        taskId: 'task_001',
        taskReviewId: 'review_001',
        metadata: {
          taskTitle: 'Create Product Catalog Page',
          reviewComment: 'Please add more filtering options and improve the search functionality',
          reviewedBy: 'john.creator@example.com'
        }
      }
    ];

    // Insert notifications with timestamp variations
    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i];
      const hoursAgo = i + 1; // Each notification is 1 hour older than the previous
      const timestamp = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
      
      await prisma.notification.upsert({
        where: { id: notification.id },
        update: {},
        create: {
          ...notification,
          createdAt: timestamp,
          updatedAt: timestamp
        }
      });
    }

    console.log('✅ Notifications created');
    console.log('🎉 Seeding completed successfully!');
    
    // Print summary
    console.log('\n📊 SEEDING SUMMARY:');
    console.log(`✅ Users: ${users.length}`);
    console.log(`✅ Projects: 1`);
    console.log(`✅ Project Members: ${projectMembers.length}`);
    console.log(`✅ Milestones: 1`);
    console.log(`✅ Tasks: ${tasks.length}`);
    console.log(`✅ Task Reviews: ${taskReviews.length}`);
    console.log(`✅ Notifications: ${notifications.length}`);
    
    console.log('\n🎯 TEST DATA FOR ompawar2324@gmail.com:');
    console.log('- Added as TASK_COMPLETER to "E-commerce Platform"');
    console.log('- Has 4 notifications (PROJECT_MEMBER_ADDED, TASK_DUE_REMINDER, TASK_OVERDUE, TASK_REJECTED)');
    console.log('- Assigned to task: "Create Product Catalog Page"');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedNotifications()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });