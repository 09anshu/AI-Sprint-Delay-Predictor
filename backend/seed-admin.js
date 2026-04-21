/**
 * seed-admin.js — Create default admin account.
 * Run: node seed-admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@sprint.com' });
    if (existing) {
      existing.role = 'admin';
      existing.status = 'active';
      await existing.save();
      console.log('✅ Existing admin account updated: admin@sprint.com');
    } else {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await new User({
        name: 'Admin',
        email: 'admin@sprint.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
      }).save();
      console.log('✅ Admin account created: admin@sprint.com / admin123');
    }

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
