const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection (TBD)
// const pool = require('./db/connection');

// Routes (TBD)
// app.use('/api/leads', require('./routes/leads'));
// app.use('/api/companies', require('./routes/companies'));
// app.use('/api/segments', require('./routes/segments'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Lead Management & Email CRM API - v0.1.0' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📊 Lead Management & Email CRM Tool');
});
