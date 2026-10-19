require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

const sampleUsers = [
    { name: 'Rahim Ahmed', email: 'rahim@test.com', password: '123456', gender: 'Male', age: 28, bloodGroup: 'O+', phoneNumber: '01711111111', district: 'Dhaka', isDonorAvailable: true, totalDonations: 5, badge: 'Silver' },
    { name: 'Fatima Khan', email: 'fatima@test.com', password: '123456', gender: 'Female', age: 25, bloodGroup: 'A+', phoneNumber: '01722222222', district: 'Dhaka', isDonorAvailable: true, totalDonations: 12, badge: 'Gold' },
    { name: 'Karim Hossain', email: 'karim@test.com', password: '123456', gender: 'Male', age: 30, bloodGroup: 'B+', phoneNumber: '01733333333', district: 'Chittagong', isDonorAvailable: true, totalDonations: 2, badge: 'Bronze' },
    { name: 'Nasrin Akter', email: 'nasrin@test.com', password: '123456', gender: 'Female', age: 27, bloodGroup: 'AB+', phoneNumber: '01744444444', district: 'Dhaka', isDonorAvailable: true, totalDonations: 28, badge: 'Platinum' },
    { name: 'Rakib Islam', email: 'rakib@test.com', password: '123456', gender: 'Male', age: 32, bloodGroup: 'O-', phoneNumber: '01755555555', district: 'Sylhet', isDonorAvailable: true, totalDonations: 0, badge: 'None' }
];

async function seed() {
    try {
        await connectDB();

        // Clear existing sample users
        await User.deleteMany({ email: { $in: sampleUsers.map(u => u.email) } });

        // Insert users (triggers pre-save password hashing)
        for (const userData of sampleUsers) {
            await User.create(userData);
        }

        console.log('✅ Seeded 5 sample users (all passwords: 123456)');
        console.log('📧 Emails:', sampleUsers.map(u => u.email).join(', '));
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        process.exit(1);
    }
}

seed();
