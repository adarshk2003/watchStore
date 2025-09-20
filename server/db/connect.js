const mongoose = require('mongoose');
const dotenv = require('dotenv');
const config = require('./config/config.json'); // adjust path if needed
dotenv.config();

async function mongoConnect() {
  try {
    const env = process.env.NODE_ENV || 'development';
    const dbUrl = env === 'production' ? process.env.MONGODB_URI : config[env].database.url;

    const visibleUri = dbUrl.replace(/:\/\/.*@/, '://****:****@');
    console.log("Trying to connect to MongoDB:", visibleUri);

    await mongoose.connect(dbUrl); // no need for useNewUrlParser/useUnifiedTopology in Mongoose v6+
    console.log("✅ Database connection established!");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  }
}

module.exports = mongoConnect;
