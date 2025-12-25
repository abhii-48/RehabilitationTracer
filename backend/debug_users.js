import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const debugUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const doctors = await User.find({ role: 'doctor' });
        console.log(`Found ${doctors.length} doctors.`);

        doctors.forEach(doc => {
            console.log(`- Name: ${doc.firstName} ${doc.lastName}, ID: ${doc.doctorId}, Domain: "${doc.domain}"`);
        });

        const allUsers = await User.find({});
        console.log(`Total users in DB: ${allUsers.length}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugUsers();
