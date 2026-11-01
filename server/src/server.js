import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { getJwtSecret } from './config/auth.js';
import { initMailer } from './config/mailer.js';
import { initSlaCronJobs } from './jobs/slaCron.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    getJwtSecret();
    const { default: app } = await import('./app.js');

    // Connect to Database
    await connectDB();

    // Initialize Mailer
    initMailer();

    // Initialize Background SLA Cron Jobs
    initSlaCronJobs();

    // Start HTTP Listener
    app.listen(PORT, () => {
      console.log(`[Server] CampusVoice API server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error(`[Server Startup Error] Could not start server: ${error.message}`);
    console.error(`[Server Notice] Server start aborted. Please ensure your MONGODB_URI is properly configured.`);
  }
};

startServer();
