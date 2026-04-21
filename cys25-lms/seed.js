const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/cys25-lms';

const start = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Define a simple schema inline to avoid import issues in this standalone script
        const userSchema = new mongoose.Schema({
            name: String,
            username: { type: String, unique: true },
            password: String, // In production, hash this!
            role: String,
            status: String,
            createdAt: { type: Date, default: Date.now }
        });

        // Check if model already exists or compile it
        const User = mongoose.models.User || mongoose.model('User', userSchema);

        // Check if admin already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (!existingAdmin) {
            await User.create({
                name: 'System Administrator',
                username: 'admin',
                password: 'password123',
                role: 'admin',
                status: 'Active'
            });
            console.log('🚀 SYSTEM ALERT: Admin user created successfully!');
        }

        // Add Teacher
        const existingTeacher = await User.findOne({ username: 'teacher' });
        if (!existingTeacher) {
            await User.create({
                name: 'Dr. Vector',
                username: 'teacher',
                password: 'password123',
                role: 'teacher',
                status: 'Active'
            });
            console.log('🚀 SYSTEM ALERT: Teacher user created successfully!');
        }

        // Add Student
        const existingStudent = await User.findOne({ username: 'student' });
        if (!existingStudent) {
            await User.create({
                name: 'Alex Cipher',
                username: 'student',
                password: 'password123',
                role: 'student',
                status: 'Active'
            });
            console.log('🚀 SYSTEM ALERT: Student user created successfully!');
        }

        console.log('💾 Database "cys25-lms" should now appear in Compass.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

start();
