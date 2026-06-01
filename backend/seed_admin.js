import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'business'], default: 'business' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/whatsapp-b2b');
    
    const email = 'utkarsh@gmail.com';
    let admin = await User.findOne({ email });
    
    if (admin) {
      admin.role = 'admin';
      await admin.save();
      console.log('Existing user updated to admin role.');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      admin = await User.create({
        name: 'Utkarsh Admin',
        email,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created successfully. Password: password123');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

seed();
