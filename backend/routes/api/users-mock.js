const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');

// Mock users storage (in real app, this would be in database)
let mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    phone: '+1234567890',
    address: '123 Admin St',
    organization: 'SDMS Admin',
    date: new Date()
  },
  {
    id: '2',
    name: 'John Donor',
    email: 'donor@example.com',
    password: 'password123',
    role: 'donor',
    phone: '+1234567891',
    address: '456 Donor Ave',
    organization: 'Generous Hearts Foundation',
    date: new Date()
  },
  {
    id: '3',
    name: 'Jane Recipient',
    email: 'recipient@example.com',
    password: 'password123',
    role: 'recipient',
    phone: '+1234567892',
    address: '789 Recipient Rd',
    organization: 'Community Help Center',
    date: new Date()
  }
];

// @route   POST api/users
// @desc    Register user (Mock)
// @access  Public
router.post('/', async (req, res) => {
  const { name, email, password, role, phone, address, organization } = req.body;

  try {
    // Check if user already exists
    let user = mockUsers.find(u => u.email === email);
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    // Create new user with unique ID
    const newUser = {
      id: String(Date.now()), // Use timestamp for unique ID
      name,
      email,
      password, // In real app, hash this
      role,
      phone: phone || '',
      address: address || '',
      organization: organization || '',
      date: new Date()
    };

    mockUsers.push(newUser);

    // Return JWT
    const payload = {
      user: {
        id: newUser.id,
        role: newUser.role
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

// @route   GET api/users
// @desc    Get all users (Mock) - Admin only
// @access  Private
router.get('/', (req, res) => {
  try {
    const users = mockUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      organization: user.organization,
      date: user.date
    }));
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Export function to get mock users for sharing with auth-mock
module.exports = router;
module.exports.getMockUsers = () => mockUsers;