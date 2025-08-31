import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/uspeak-pro';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let isConnected = false;

async function waitForConnectionReady(timeoutMs = 5000) {
  if (mongoose.connection.readyState === 1) return;

  return new Promise<void>((resolve, reject) => {
    const onOpen = () => {
      cleanup();
      resolve();
    };

    const onError = (err: any) => {
      cleanup();
      reject(err);
    };

    const onTimeout = () => {
      cleanup();
      reject(new Error('Timed out waiting for mongoose connection to become ready'));
    };

    const cleanup = () => {
      mongoose.connection.removeListener('open', onOpen);
      mongoose.connection.removeListener('error', onError);
      clearTimeout(timer);
    };

    mongoose.connection.once('open', onOpen);
    mongoose.connection.once('error', onError);

    const timer = setTimeout(onTimeout, timeoutMs);
  });
}

async function connectDB() {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    } as mongoose.ConnectOptions;

    // Start the connection
    await mongoose.connect(MONGODB_URI, opts);

    // Ensure the driver has reached the open/connected state before returning
    await waitForConnectionReady(5000);

    isConnected = mongoose.connection.readyState === 1;

    return mongoose.connection;
  } catch (e) {
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }
}

export default connectDB;
