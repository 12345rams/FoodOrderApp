import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is required. Add it in backend/.env or workspace .env');
  }
  await mongoose.connect(uri);
}

