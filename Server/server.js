const cors = require('cors');
const express = require('express');
require('dotenv').config();

const { connectDatabase } = require('./config/db.config');
const restaurantRoutes = require('./routes/restaurant.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:4200' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/v1/health', (_request, response) => {
  response.json({ status: 'ok', service: "Jo's House of Subs API" });
});

app.use('/api/v1/restaurant', restaurantRoutes);
app.use('/uploads', express.static('uploads'));
app.use(errorMiddleware);

connectDatabase()
  .then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((error) => {
    console.error('Database connection failed:', error.message);
    process.exitCode = 1;
  });

module.exports = app;
