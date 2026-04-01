import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const createSpecificAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedome';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const email = 'kanuprajapati717@gmail.com';
    const password = 'kanu1233';
    const name = 'Kanu Prajapati';

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      existingAdmin.password = password; // This will trigger the bcrypt hash in pre-save
      existingAdmin.name = name;
      await existingAdmin.save();
      console.log('Admin account updated successfully');
    } else {
      const admin = new Admin({
        email,
        password,
        name
      });
      await admin.save();
      console.log('Admin account created successfully');
    }

    console.log('Email:', email);
    console.log('Password:', password);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createSpecificAdmin();
