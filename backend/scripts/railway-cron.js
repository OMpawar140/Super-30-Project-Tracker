// railway-cron.js - Separate service for Railway cron jobs
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runStatusUpdates() {
  console.log('Running status updates via Railway cron...');
  
  try {
    // Direct SQL execution for better performance
    await prisma.$executeRaw`SELECT check_overdue_items();`;
    
    console.log('Status updates completed successfully');
  } catch (error) {
    console.error('Error running status updates:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the updates
runStatusUpdates();

// Package.json scripts to add:
/*
{
  "scripts": {
    "cron:status-update": "node railway-cron.js",
    "db:triggers": "psql $DATABASE_URL -f triggers.sql"
  }
}
*/

// Railway cron configuration (nixpacks.toml or railway.json)
/*
[phases.build]
cmds = ["npm install", "npx prisma generate"]

[phases.deploy]
cmds = ["npm run db:triggers"]

// In Railway dashboard, add a cron job service:
// Command: npm run cron:status-update
// Schedule: 0 * * * * (every hour)
*/