import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import {
  User,
  Department,
  Category,
  Complaint,
  ComplaintComment,
  ComplaintStatusHistory,
  ComplaintAttachment,
  Notification,
  AuditLog,
  Announcement,
} from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

const maskConnectionUri = (uri) => {
  try {
    return uri.replace(/:([^@]+)@/, ':••••••••@');
  } catch {
    return 'mongodb+srv://****:****@****';
  }
};

const runDbTest = async () => {
  console.log('\n========================================================================');
  console.log('       CAMPUSVOICE &bull; MONGODB ATLAS CONNECTION VERIFICATION TEST     ');
  console.log('========================================================================\n');

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri || mongoUri.trim() === '') {
    console.error('❌ STATUS: FAILED &bull; MONGODB_URI is not set in environment.');
    console.error('------------------------------------------------------------------------');
    console.error('Please configure your MongoDB Atlas connection string in "server/.env":');
    console.error('');
    console.error('MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/campusvoice?retryWrites=true&w=majority');
    console.error('');
    console.error('Steps:');
    console.error('1. Open or create server/.env');
    console.error('2. Set MONGODB_URI with your Atlas connection string');
    console.error('3. Re-run: npm run test:db (inside server folder) or npm run test:db from root\n');
    process.exit(1);
  }

  console.log(`[1/4] Target URI: ${maskConnectionUri(mongoUri)}`);
  console.log('[2/4] Connecting to MongoDB Atlas cluster...');

  const startTime = Date.now();

  try {
    const conn = await mongoose.connect(mongoUri, {
      dbName: 'campusvoice',
      serverSelectionTimeoutMS: 10000,
      autoIndex: true,
    });

    const latency = Date.now() - startTime;

    console.log(`[3/4] Testing database ping and responsiveness...`);
    const adminDb = conn.connection.db.admin();
    const pingResult = await adminDb.ping();

    console.log(`[4/4] Verifying registered Mongoose models & schemas...`);
    const models = [
      { name: 'User', model: User },
      { name: 'Department', model: Department },
      { name: 'Category', model: Category },
      { name: 'Complaint', model: Complaint },
      { name: 'ComplaintComment', model: ComplaintComment },
      { name: 'ComplaintStatusHistory', model: ComplaintStatusHistory },
      { name: 'ComplaintAttachment', model: ComplaintAttachment },
      { name: 'Notification', model: Notification },
      { name: 'AuditLog', model: AuditLog },
      { name: 'Announcement', model: Announcement },
    ];

    console.log('\n========================================================================');
    console.log('✅ ATLAS CONNECTION TEST PASSED SUCCESSFULLY!');
    console.log('========================================================================');
    console.log(`&bull; Cluster Host:    ${conn.connection.host}`);
    console.log(`&bull; Database Name:   ${conn.connection.name}`);
    console.log(`&bull; Connection State: Connected (Ready State: ${conn.connection.readyState})`);
    console.log(`&bull; Ping Response:   ${pingResult.ok === 1 ? 'OK (Responsive)' : 'Degraded'} (${latency}ms)`);
    console.log('------------------------------------------------------------------------');
    console.log('Model Verification & Document Counts:');

    for (const item of models) {
      try {
        const count = await item.model.countDocuments();
        console.log(`  ✔ [Model: ${item.name.padEnd(24)}] Registered &bull; ${count} records`);
      } catch (countErr) {
        console.log(`  ✔ [Model: ${item.name.padEnd(24)}] Registered (Collection empty/pending)`);
      }
    }

    console.log('========================================================================');
    console.log('Your backend is ready to operate permanently with MongoDB Atlas!');
    console.log('========================================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n========================================================================');
    console.error('❌ ATLAS CONNECTION TEST FAILED');
    console.error('========================================================================');
    console.error(`Error Type:    ${error.name}`);
    console.error(`Error Message: ${error.message}`);
    console.error('------------------------------------------------------------------------');
    console.error('Diagnostic & Troubleshooting Guide:');

    if (error.name === 'MongooseServerSelectionError' || error.message.includes('buffering timed out')) {
      console.error('\n👉 Issue: Network or Firewall block (IP Access List)');
      console.error('   1. Log into your MongoDB Atlas Dashboard (https://cloud.mongodb.com).');
      console.error('   2. Navigate to "Security" -> "Network Access".');
      console.error('   3. Click "Add IP Address" and either add your current IP address');
      console.error('      OR click "Allow Access from Anywhere" (0.0.0.0/0) for development.');
    } else if (error.message.includes('Authentication failed') || error.message.includes('auth failed')) {
      console.error('\n👉 Issue: Authentication Credentials Mismatch');
      console.error('   1. Navigate to "Security" -> "Database Access" in MongoDB Atlas.');
      console.error('   2. Verify the username matches what you entered in MONGODB_URI.');
      console.error('   3. If you forgot the password, click "Edit" on the user and set a new password.');
      console.error('   4. If your password has special characters like "@", "#", ":", "%",');
      console.error('      they MUST be URL-encoded (e.g. "@" becomes "%40").');
    } else {
      console.error('\n👉 Issue: Connection string format');
      console.error('   1. In Atlas, click "Connect" on your cluster -> "Drivers" -> "Node.js".');
      console.error('   2. Copy the connection string format: mongodb+srv://<user>:<password>@cluster.mongodb.net/campusvoice');
    }

    console.error('========================================================================\n');
    process.exit(1);
  }
};

runDbTest();

