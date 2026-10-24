const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const db = require('../models/dbStore');

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'buyer', businessName, categoryInterests, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = db.collection('users').findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 8);
    const user = db.collection('users').create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      status: 'active'
    });

    if (role === 'buyer') {
      db.collection('buyerProfiles').create({
        userId: user._id,
        businessName: businessName || `${name}'s Brand`,
        categoryInterests: categoryInterests || ['apparel'],
        location: location || { city: 'Jaipur', state: 'Rajasthan' }
      });
    } else if (role === 'manufacturer') {
      db.collection('manufacturers').create({
        owner: user._id,
        businessName: businessName || `${name} Manufacturing`,
        categories: ['apparel'],
        capabilities: ['screen printing', 'stitching'],
        moq: { min: 500, max: 3000 },
        capacityPerMonth: 10000,
        leadTimeDays: { min: 20, max: 35 },
        sampleFee: 500,
        rating: 5.0,
        totalCompletedOrders: 0,
        location: location || { city: 'Jaipur', state: 'Rajasthan' },
        status: 'pending'
      });
    }

    const token = generateToken(user);
    const safeUser = { _id: user._id, name: user.name, email: user.email, role: user.role };

    db.logAudit({
      actorId: user._id,
      entityType: 'user',
      entityId: user._id,
      action: 'USER_REGISTERED',
      after: safeUser
    });

    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.collection('users').findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const safeUser = { _id: user._id, name: user.name, email: user.email, role: user.role };

    let profile = null;
    if (user.role === 'buyer') {
      profile = db.collection('buyerProfiles').findOne({ userId: user._id });
    } else if (user.role === 'manufacturer') {
      profile = db.collection('manufacturers').findOne({ owner: user._id });
    }

    res.json({ token, user: safeUser, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = req.user;
    let profile = null;
    if (user.role === 'buyer') {
      profile = db.collection('buyerProfiles').findOne({ userId: user._id });
    } else if (user.role === 'manufacturer') {
      profile = db.collection('manufacturers').findOne({ owner: user._id });
    }

    res.json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      profile
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllDemoUsers = async (req, res) => {
  // Helpful endpoint for quick-switching test users in the prototype UI
  const users = db.collection('users').find().map(u => ({
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role
  }));
  res.json({ users });
};
