const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const pool = require('./db/connection');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/leads', require('./routes/leads'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/segments', require('./routes/segments'));
app.use('/api/imports', require('./routes/imports'));

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Lead Management & Email CRM API - v0.1.0',
    features: [
      'Lead import & cleaning',
      'Company aggregation',
      'Lead scoring',
      'Industry classification',
      'Email segmentation',
      'Rep packaging & export'
    ]
  });
});

// Health check with database verification
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (err) {
    res.status(503).json({
      status: 'ERROR',
      database: 'disconnected',
      error: err.message
    });
  }
});

// Database info endpoint
app.get('/api/database-info', async (req, res) => {
  try {
    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' ORDER BY table_name`
    );
    res.json({
      tables: tables.rows.map(r => r.table_name),
      count: tables.rows.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
  console.log(`📚 API Docs: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
});
