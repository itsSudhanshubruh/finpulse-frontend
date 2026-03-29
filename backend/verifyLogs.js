require('dotenv').config();
const mongoose = require('mongoose');
const AuthLog = require('./models/AuthLog');

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/finpulse');
        const logs = await AuthLog.find().sort({ timestamp: -1 }).limit(5);
        console.log("RECENT AUTH LOGS IN MONGODB:");
        console.log(JSON.stringify(logs, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
verify();
