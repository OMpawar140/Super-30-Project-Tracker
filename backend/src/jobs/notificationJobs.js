const cron = require('node-cron');
const { getStartedTasksWithoutNotification, getOverdueTasksForNotification, getUpcomingTasks } = require('../services/taskService');
const NotificationTriggers = require('../utils/notificationTriggers');

// Runs every day at 1am
// cron.schedule('0 1 * * *',

// Runs every hour
cron.schedule('0 * * * *', async () => {

    console.log('Running daily notification job at', new Date().toISOString());

    // 1. Started tasks without notifications
    const startedTasks = await getStartedTasksWithoutNotification();
    if (startedTasks.length) {
        await NotificationTriggers.processStartedTasks(startedTasks);
    }

    // 2. Overdue tasks
    const overdueTasks = await getOverdueTasksForNotification();
    if (overdueTasks.length) {
        await NotificationTriggers.processOverdueTasks(overdueTasks);
    }

    // 3. Tasks due in 3 days
    const upcomingTasks = await getUpcomingTasks(3);
    if (upcomingTasks.length) {
        await NotificationTriggers.processDueReminders(upcomingTasks, 3);
    }
});