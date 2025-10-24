const express = require('express');
const path = require('path');
require('dotenv').config();
const database = require('./config/database');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Flag to track if database is initialized
let dbInitialized = false;

// Middleware to initialize database on first request (for Vercel)
app.use(async (req, res, next) => {
  if (!dbInitialized && (process.env.VERCEL || process.env.NODE_ENV === 'production')) {
    try {
      await database.initializeDatabase();
      dbInitialized = true;
    } catch (err) {
      console.error('Error initializing database:', err);
      // Don't fail the request, just log it
    }
  }
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Error handling middleware
app.use(errorHandler);

/**
 * Start server - for local development
 */
async function startServer() {
  try {
    // Initialize database
    await database.initializeDatabase();
    dbInitialized = true;

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n✓ Server running on http://localhost:${PORT}`);
      console.log('✓ Ready to accept CSV files');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start server if this is not being used by Vercel
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  startServer();
}

module.exports = app;
