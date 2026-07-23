import cron from 'node-cron';
import config from '../config/index.js';
import { syncProducts, syncCategories } from '../services/irecService.js';

let isRunning = false;

/**
 * Start scheduled sync tasks
 */
export function startSyncJobs() {
  console.log(`🕐 Starting sync scheduler (interval: ${config.irec.syncInterval})`);

  // Product sync
  const productJob = cron.schedule(config.irec.syncInterval, async () => {
    if (isRunning) {
      console.log('⚠️ Previous sync still running, skipping...');
      return;
    }

    isRunning = true;
    try {
      await syncProducts();
    } catch (error) {
      console.error('❌ Scheduled product sync failed:', error.message);
    } finally {
      isRunning = false;
    }
  });

  // Category sync (less frequent)
  cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Starting category sync...');
    try {
      await syncCategories();
      console.log('✅ Category sync completed');
    } catch (error) {
      console.error('❌ Category sync failed:', error.message);
    }
  });

  // Stop jobs on process exit
  process.on('SIGTERM', () => {
    console.log('Stopping sync jobs...');
    productJob.stop();
  });

  process.on('SIGINT', () => {
    console.log('Stopping sync jobs...');
    productJob.stop();
  });

  // Run initial sync after 5 seconds
  console.log('⏳ Scheduling initial sync in 5 seconds...');
  setTimeout(async () => {
    console.log('🔄 Running initial product sync...');
    try {
      await syncProducts();
    } catch (error) {
      console.error('❌ Initial sync failed:', error.message);
      console.log('⚠️ The server will continue running. Products will sync on next schedule.');
    }
  }, 5000);
}
