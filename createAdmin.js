import Admin from './models/Admin.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const existing = await Admin.findOne({ email: 'admin@wedome.com' });
    if (existing) {
      console.log('Admin already exists');
      process.exit();
    }

    const admin = new Admin({
      email: 'admin@wedome.com',
      password: 'adminpassword123',
      name: 'Super Admin'
    });

    await admin.save();
    console.log('Admin created successfully');
    console.log('Email: admin@wedome.com');
    console.log('Password: adminpassword123');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();
