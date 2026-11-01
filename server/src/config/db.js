import mongoose from 'mongoose';
import '../models/index.js'; // Ensure all models are loaded and registered

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri || mongoUri.trim() === '') {
    throw new Error('MONGO_URI or MONGODB_URI is not configured.');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      dbName: 'campusvoice',
      serverSelectionTimeoutMS: 10000,
      autoIndex: true,
    });

    console.log(`[Database] Connected to database: ${conn.connection.name}`);
    console.log(`[Database] Connection State: Ready (${conn.connection.readyState === 1 ? 'Connected' : 'Connecting'})`);

    // Attach event listeners for connection monitoring
    mongoose.connection.on('error', (err) => {
      console.error(`[Database Error] MongoDB connection issue: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database Warning] MongoDB connection disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[Database Info] MongoDB reconnected successfully.');
    });

    return conn;
  } catch (error) {
    console.error('\n========================================================================');
    console.error('❌ [Database Connection Error] Failed to connect to configured MongoDB.');
    console.error('========================================================================');
    console.error(`Error type: ${error.name}`);

    if (error.name === 'MongooseServerSelectionError') {
      console.error('\n💡 Troubleshooting Guide:');
      console.error('1. Network Access (IP Whitelist):');
      console.error('   In MongoDB Atlas -> Network Access, verify that your current IP address');
      console.error('   is added to the IP Access List.');
      console.error('2. Database User Credentials:');
      console.error('   In MongoDB Atlas -> Database Access, verify the username and password.');
      console.error('========================================================================\n');
    }

    throw error;
  }
};
