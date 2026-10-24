const jwt = require('jsonwebtoken');
const env = require('../config/env');
const db = require('../models/dbStore');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers['x-user-id']) {
    // Convenience for dev/demo switching
    const user = db.collection('users').findById(req.headers['x-user-id']);
    if (user) {
      req.user = user;
      return next();
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = db.collection('users').findById(decoded.id);
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'User invalid or inactive' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access restricted. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}`
      });
    }
    next();
  };
}

module.exports = {
  authenticate,
  requireRole
};
