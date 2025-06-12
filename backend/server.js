const express = require('express');
const app = express();
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');

app.use(express.json({ extended: false }));
app.use(cors());

// Connect Database and setup routes
connectDB().then((dbConnected) => {
  if (!dbConnected) {
    console.log('Warning: Server running without database connection. Using mock data for demonstration.');
    // Use mock routes
    app.use('/api/users', require('./routes/api/users-mock'));
    app.use('/api/auth', require('./routes/api/auth-mock'));
    app.use('/api/donations', require('./routes/api/donations-mock'));
    app.use('/api/requests', require('./routes/api/requests-mock'));
  } else {
    // Use database routes
    app.use('/api/users', require('./routes/api/users'));
    app.use('/api/auth', require('./routes/api/auth'));
    app.use('/api/donations', require('./routes/api/donations'));
    app.use('/api/requests', require('./routes/api/requests'));
  }
  
  // Common routes (these work with or without database)
  app.use('/api/items', require('./routes/api/items'));
  app.use('/api/tracking', require('./routes/api/tracking'));
  app.use('/api/feedback', require('./routes/api/feedback'));
  app.use('/api/analytics', require('./routes/api/analytics'));
  app.use('/api/categories', require('./routes/api/categories'));
  app.use('/api/logistics', require('./routes/api/logistics'));
  app.use('/api/notifications', require('./routes/api/notifications'));
  app.use('/api/matching', require('./routes/api/matching'));

  // Serve static assets in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
  }

  const PORT = process.env.PORT || 5001;  // Change from 5000 to 5001 or another free port
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}).catch(err => {
  console.error('Failed to start server:', err);
});