const express = require('express');
const router = express.Router();
const queries = require('../db/queries');

// Get all leads with optional filters
router.get('/', async (req, res) => {
  try {
    const { country, source, companyId } = req.query;
    const filters = {};

    if (country) filters.country = country;
    if (source) filters.source = source;
    if (companyId) filters.companyId = parseInt(companyId);

    const leads = await queries.getLeads(filters);
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get lead by ID
router.get('/:id', async (req, res) => {
  try {
    const lead = await queries.getLeadById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const score = await queries.getLeadScore(req.params.id);
    res.json({ lead, score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get leads by country
router.get('/filter/by-country', async (req, res) => {
  try {
    const { country } = req.query;
    if (!country) {
      return res.status(400).json({ error: 'Country required' });
    }

    const leads = await queries.getLeads({ country });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get leads by source (tradeshow, email campaign, etc.)
router.get('/filter/by-source', async (req, res) => {
  try {
    const { source } = req.query;
    if (!source) {
      return res.status(400).json({ error: 'Source required' });
    }

    const leads = await queries.getLeads({ source });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get top scored leads
router.get('/top/scored', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const leads = await queries.getLeads({});

    const topLeads = leads
      .filter(l => l.total_score !== null)
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, parseInt(limit));

    res.json(topLeads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get lead statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const leads = await queries.getLeads({});

    const stats = {
      total_leads: leads.length,
      by_country: {},
      by_source: {},
      by_industry: {},
      avg_score: 0,
    };

    let totalScore = 0;
    let scoredLeads = 0;

    leads.forEach(lead => {
      // By country
      stats.by_country[lead.country || 'Unknown'] =
        (stats.by_country[lead.country || 'Unknown'] || 0) + 1;

      // By source
      stats.by_source[lead.source || 'Unknown'] =
        (stats.by_source[lead.source || 'Unknown'] || 0) + 1;

      // By industry
      stats.by_industry[lead.industry || 'Unclassified'] =
        (stats.by_industry[lead.industry || 'Unclassified'] || 0) + 1;

      // Average score
      if (lead.total_score) {
        totalScore += lead.total_score;
        scoredLeads += 1;
      }
    });

    stats.avg_score = scoredLeads > 0 ? (totalScore / scoredLeads).toFixed(2) : 0;

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export leads as JSON
router.post('/export/json', async (req, res) => {
  try {
    const { country, source, industry } = req.body;
    let leads = await queries.getLeads({
      country: country || undefined,
      source: source || undefined,
    });

    if (industry) {
      leads = leads.filter(l => l.industry === industry);
    }

    res.json({
      export_date: new Date().toISOString(),
      lead_count: leads.length,
      leads: leads,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export leads as CSV
router.post('/export/csv', async (req, res) => {
  try {
    const { country, source, industry } = req.body;
    let leads = await queries.getLeads({
      country: country || undefined,
      source: source || undefined,
    });

    if (industry) {
      leads = leads.filter(l => l.industry === industry);
    }

    // Build CSV
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Job Title', 'Company', 'Industry', 'Country', 'Source', 'Score'];
    const rows = leads.map(l => [
      l.first_name || '',
      l.last_name || '',
      l.email || '',
      l.phone || '',
      l.job_title || '',
      l.company_name || '',
      l.industry || '',
      l.country || '',
      l.source || '',
      l.total_score || '',
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads-export.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
