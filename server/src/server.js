const app = require('./app');
const env = require('./config/env');
const seed = require('./utils/seedData');
const db = require('./models/dbStore');

// Ensure seeded if users are empty
if (db.collection('users').count() === 0) {
  seed();
}

const server = app.listen(env.PORT, () => {
  console.log(`🚀 BatchBridge AI Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  console.log(`🔗 Health check available at http://localhost:${env.PORT}/api/health`);
});

process.on('SIGTERM', () => {
  server.close(() => console.log('Process terminated'));
});
