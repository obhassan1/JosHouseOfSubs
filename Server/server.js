const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
require('dotenv').config();

const { connectDatabase } = require('./config/db.config');
const adminRoutes = require('./routes/admin.routes');
const menuRoutes = require('./routes/menu.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const defaultOrigins = [
  'http://localhost:4200',
  'https://joshouseofsubs.com',
  'https://www.joshouseofsubs.com',
  'https://joshouseofsubs-web.onrender.com'
];

const configuredOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.CLIENT_ORIGINS
]
  .filter(Boolean)
  .flatMap((origins) => origins.split(','))
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = new Set([
  ...defaultOrigins,
  ...configuredOrigins
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin.replace(/\/$/, ''))) {
      callback(null, true);
      return;
    }

    const error = new Error('This website is not allowed to access the API.');
    error.status = 403;
    callback(error);
  }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/v1/health', (_request, response) => {
  response.json({ status: 'ok', service: "Jo's House of Subs API" });
});

app.use('/api/v1/restaurant', restaurantRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/uploads', express.static('uploads'));
app.get('/', (_request, response) => {
  response.json({
    message: "Jo's House of Subs API is running"
  });
});
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