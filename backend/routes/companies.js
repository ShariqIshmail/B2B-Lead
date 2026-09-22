const express = require('express');
const router = express.Router();
const queries = require('../db/queries');

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await queries.getCompanies();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get company by ID with leads
router.get('/:id', async (req, res) => {
  try {
    const company = await queries.getCompanyById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const leads = await queries.getLeads({ companyId: req.params.id });
    res.json({ company, leads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update company industry classification
router.put('/:id/industry', async (req, res) => {
  try {
    const { industry, confidence } = req.body;
    const company = await queries.updateCompanyIndustry(req.params.id, industry, confidence);
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get companies by industry
router.get('/filter/by-industry', async (req, res) => {
  try {
    const { industry } = req.query;
    if (!industry) {
      return res.status(400).json({ error: 'Industry filter required' });
    }

    const companies = await queries.getCompanies();
    const filtered = companies.filter(c => c.industry === industry);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get companies by country
router.get('/filter/by-country', async (req, res) => {
  try {
    const { country } = req.query;
    if (!country) {
      return res.status(400).json({ error: 'Country filter required' });
    }

    const companies = await queries.getCompanies();
    const filtered = companies.filter(c => c.country === country);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get industry statistics
router.get('/stats/industries', async (req, res) => {
  try {
    const companies = await queries.getCompanies();
    const stats = {};

    companies.forEach(c => {
      const industry = c.industry || 'Unclassified';
      if (!stats[industry]) {
        stats[industry] = { count: 0, leads: 0 };
      }
      stats[industry].count += 1;
      stats[industry].leads += c.lead_count || 0;
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
