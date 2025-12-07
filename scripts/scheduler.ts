// File: /scripts/scheduler.ts
import fetch from 'node-fetch';

async function runScheduler() {
  console.log('⏰ Running local scheduler...');
  try {
    const response = await fetch('http://localhost:3000/api/scheduler');
    const data = await response.json();
    console.log('🟢 Scheduler result:', data);
  } catch (err) {
    console.error('❌ Scheduler error:', err);
  }
}

// Run every minute
setInterval(runScheduler, 60 * 1000);

// Run immediately on start
runScheduler();
