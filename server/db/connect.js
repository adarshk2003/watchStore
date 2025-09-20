const mongoose = require('mongoose');
const config = require('./config/config.json');
const dotenv = require('dotenv');
dotenv.config();

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env].database;

const dbUri = env === 'production' ? process.env.MONGODB_URI : dbConfig.url;

function mongoConnect() {
  return mongoose.connect(dbUri)
    .then(() => console.log('Database connected!'))
    .catch(err => console.error('Database connection error:', err));
}

module.exports = mongoConnect;
