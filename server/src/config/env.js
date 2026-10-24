const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'batchbridge_super_secret_jwt_key_2026',
  AI_PROVIDER: process.env.AI_PROVIDER || 'mock',
  AI_API_KEY: process.env.AI_API_KEY || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5174'
};
