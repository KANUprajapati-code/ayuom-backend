import { User } from './models/User.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if new User model already has the admin
    let userAdmin = await User.findOne({ email: 'kanuprajapati717@gmail.com' });
    
    if (userAdmin) {
      userAdmin.role = 'admin';
      userAdmin.isApproved = true;
      userAdmin.password = 'kanu1233'; // Resetting to ensure hash
      userAdmin.name = 'Kanu Prajapati';
      await userAdmin.save();
      console.log('Admin updated in User model successfully');
    } else {
      userAdmin = new User({
        email: 'kanuprajapati717@gmail.com',
        password: 'kanu1233',
        name: 'Kanu Prajapati',
        role: 'admin',
        isApproved: true,
        clinicName: 'Wedome Healthcare Hub'
      });
      await userAdmin.save();
      console.log('New Admin created in User model successfully');
    }

    console.log('Admin Credentials Verified:');
    console.log('Email: kanuprajapati717@gmail.com');
    console.log('Password: kanu1233');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

updateAdmin();
