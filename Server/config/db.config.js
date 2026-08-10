const mongoose = require('mongoose');

async function connectDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn('DATABASE_URL is not set. Starting without MongoDB.');
    return;
  }

  await mongoose.connect(databaseUrl);
  console.log('Database connected');
}

module.exports = { connectDatabase };
