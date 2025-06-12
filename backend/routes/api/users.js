const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const roleAuth = require('../../middleware/roleAuth');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('role', 'Role is required').isIn(['admin', 'donor', 'recipient'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone, address, organization } = req.body;

    try {
      // Check if database is connected
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ errors: [{ msg: 'Database connection unavailable' }] });
      }
      
      // See if user exists
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        name,
        email,
        password,
        role,
        phone,
        address,
        organization
      });

      await user.save();

      // Return jsonwebtoken
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
          if (err) {
            console.error('JWT Sign Error:', err.message);
            return res.status(500).json({ errors: [{ msg: 'Error generating token' }] });
          }
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('User Registration Error:', err.message);
      res.status(500).json({ errors: [{ msg: 'Server error', details: err.message }] });
    }
  }
);

// @route   GET api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', [auth, roleAuth(['admin'])], async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;