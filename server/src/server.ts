import app from './app';
import { config } from './config';
import { initializeDatabase } from './database/db';
import { seedData } from './database/seed';

async function startServer() {
  await initializeDatabase();
  await seedData();

  app.listen(config.port, () => {
    console.log(`
======================================================
🚀 Smart Visitor Management System Backend Active!
------------------------------------------------------
🔗 API URL     : http://localhost:${config.port}/api
🛡️ Environment : ${config.nodeEnv}
======================================================
    `);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
