const mongoose = require('mongoose');
const config = require('./config/config.json');
const dotenv = require('dotenv');
dotenv.config();

const env = process.env.NODE_ENV || 'development';
const dbConfig = (config[env] || config.development).database;

const dbUri = process.env.MONGODB_URI || dbConfig.url;

function mongoConnect() {
  if (!dbUri) {
    return Promise.reject(new Error('No MongoDB connection URL is configured.'));
  }

  return mongoose.connect(dbUri)
    .then(() => console.log('Database connected!'))
    .catch(err => {
      console.error('Database connection error:', err);
      throw err;
    });
}

module.exports = mongoConnect;
