const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function mongoConnect() {
  try {
    const visibleUri = process.env.MONGODB_URI?.replace(/:\/\/.*@/, '://****:****@');
    console.log("Trying to connect to MongoDB:", visibleUri);

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(" Database connection established!");
  } catch (error) {
    console.error(" Database connection error:", error);
    process.exit(1);
  }
}

module.exports = mongoConnect;
