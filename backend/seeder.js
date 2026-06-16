require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Service = require('./models/Service');
const Settings = require('./models/Settings');

connectDB();

const seedData = async () => {
  try {
    await User.deleteMany();
    await Service.deleteMany();
    await Settings.deleteMany();

    // Create Admin
    const admin = await User.create({
      email: 'admin@trimflow.com',
      password: 'password123',
      role: 'admin'
    });

    // Create Settings
    await Settings.create({
      shopName: 'TrimFlow Luxury Barbershop',
      currency: '$',
      businessHours: { open: '09:00', close: '20:00' }
    });

    // Create Initial Services
    await Service.insertMany([
      { name: 'Hair Cut', price: 30, duration: 30, description: 'Classic men\'s haircut with straight razor finish.' },
      { name: 'Beard Trim', price: 20, duration: 15, description: 'Precision beard shaping and hot towel finish.' },
      { name: 'Hair + Beard', price: 45, duration: 45, description: 'Full service haircut and beard grooming.' },
      { name: 'Hair Styling', price: 25, duration: 20, description: 'Wash, blow-dry, and styling with premium products.' },
      { name: 'Facial', price: 35, duration: 30, description: 'Deep cleansing and exfoliating men\'s facial.' },
      { name: 'Hair Spa', price: 40, duration: 40, description: 'Revitalizing scalp treatment and massage.' },
      { name: 'Custom Service', price: 50, duration: 60, description: 'Consult with barber for specialized requests.' }
    ]);

    console.log('Data Imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

seedData();
