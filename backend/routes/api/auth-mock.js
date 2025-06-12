const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');

// Import shared mock users from users-mock
const usersMock = require('./users-mock');

// Function to get current mock users
const getMockUsers = () => {
  return usersMock.getMockUsers();
};

// @route   POST api/auth
// @desc    Authenticate user & get token (Mock)
// @access  Public
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find mock user
    const mockUsers = getMockUsers();
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Simple password check (in real app, use bcrypt)
    if (user.password !== password) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    // Return JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: '5 days' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth
// @desc    Get user by token (Mock)
// @access  Private
router.get('/', (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, config.get('jwtSecret'));
    const mockUsers = getMockUsers();
    const user = mockUsers.find(u => u.id === decoded.user.id);
    
    if (!user) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
});

module.exports = router;