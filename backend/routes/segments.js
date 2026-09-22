const express = require('express');
const router = express.Router();
const queries = require('../db/queries');

// Get all segments
router.get('/', async (req, res) => {
  try {
    const segments = await queries.getSegments();
    res.json(segments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get segment by ID with leads
router.get('/:id', async (req, res) => {
  try {
    const segment = await queries.getSegmentById(req.params.id);
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    const leads = await queries.getSegmentLeads(req.params.id);
    res.json({ segment, leads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new segment
router.post('/', async (req, res) => {
  try {
    const { name, description, country, industry } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Segment name required' });
    }

    const criteria = {
      country: country || null,
      industry: industry || null,
    };

    const segment = await queries.createSegment(name, description, criteria, country, industry);
    res.status(201).json(segment);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Segment name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Add lead to segment
router.post('/:segmentId/leads/:leadId', async (req, res) => {
  try {
    await queries.addLeadToSegment(req.params.segmentId, req.params.leadId);
    await queries.updateSegmentLeadCount(req.params.segmentId);

    const segment = await queries.getSegmentById(req.params.segmentId);
    res.json({ message: 'Lead added to segment', segment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk add leads to segment (by filter)
router.post('/:segmentId/add-bulk', async (req, res) => {
  try {
    const { country, source, industry, minScore } = req.body;

    const segment = await queries.getSegmentById(req.params.segmentId);
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    // Get leads based on criteria
    let leads = await queries.getLeads({
      country: country || undefined,
      source: source || undefined,
    });

    if (industry) {
      leads = leads.filter(l => l.industry === industry);
    }

    if (minScore) {
      leads = leads.filter(l => l.total_score >= minScore);
    }

    // Add all leads to segment
    let addedCount = 0;
    for (const lead of leads) {
      try {
        await queries.addLeadToSegment(req.params.segmentId, lead.id);
        addedCount++;
      } catch (err) {
        // Ignore if lead already in segment
      }
    }

    await queries.updateSegmentLeadCount(req.params.segmentId);
    const updatedSegment = await queries.getSegmentById(req.params.segmentId);

    res.json({
      message: `${addedCount} leads added to segment`,
      segment: updatedSegment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get segment as exportable list
router.get('/:id/export', async (req, res) => {
  try {
    const segment = await queries.getSegmentById(req.params.id);
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    const leads = await queries.getSegmentLeads(req.params.id);

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
    res.setHeader('Content-Disposition', `attachment; filename="${segment.name}-export.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
