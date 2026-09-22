const pool = require('./connection');

// ==================== IMPORTS ====================
const addImport = async (fileName, notes = '') => {
  const result = await pool.query(
    `INSERT INTO imports (file_name, notes) VALUES ($1, $2) RETURNING *`,
    [fileName, notes]
  );
  return result.rows[0];
};

const getImports = async () => {
  const result = await pool.query('SELECT * FROM imports ORDER BY imported_at DESC');
  return result.rows;
};

// ==================== COMPANIES ====================
const getOrCreateCompany = async (name, domain = null, country = null) => {
  let result = await pool.query(
    'SELECT * FROM companies WHERE name = $1',
    [name]
  );

  if (result.rows.length > 0) {
    return result.rows[0];
  }

  // Create new company
  result = await pool.query(
    `INSERT INTO companies (name, domain, country, contact_count)
     VALUES ($1, $2, $3, 1) RETURNING *`,
    [name, domain, country]
  );
  return result.rows[0];
};

const getCompanies = async () => {
  const result = await pool.query(
    `SELECT c.*, COUNT(l.id) as lead_count
     FROM companies c
     LEFT JOIN leads l ON c.id = l.company_id
     GROUP BY c.id
     ORDER BY lead_count DESC, c.name`
  );
  return result.rows;
};

const getCompanyById = async (id) => {
  const result = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
  return result.rows[0];
};

const updateCompanyIndustry = async (companyId, industry, confidence) => {
  const result = await pool.query(
    `UPDATE companies SET industry = $1, industry_confidence = $2, last_updated = CURRENT_TIMESTAMP
     WHERE id = $3 RETURNING *`,
    [industry, confidence, companyId]
  );
  return result.rows[0];
};

const updateCompanyContactCount = async (companyId) => {
  const result = await pool.query(
    `UPDATE companies SET contact_count = (SELECT COUNT(*) FROM leads WHERE company_id = $1), last_updated = CURRENT_TIMESTAMP
     WHERE id = $1 RETURNING *`,
    [companyId]
  );
  return result.rows[0];
};

// ==================== LEADS ====================
const addLead = async (lead, importId) => {
  const { firstName, lastName, email, phone, jobTitle, country, source, companyId } = lead;

  const result = await pool.query(
    `INSERT INTO leads (company_id, first_name, last_name, email, phone, job_title, country, source, import_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [companyId, firstName, lastName, email, phone, jobTitle, country, source, importId]
  );
  return result.rows[0];
};

const getLeads = async (filters = {}) => {
  let query = `SELECT l.*, c.name as company_name, c.industry, ls.total_score FROM leads l
               LEFT JOIN companies c ON l.company_id = c.id
               LEFT JOIN lead_scores ls ON l.id = ls.lead_id
               WHERE 1=1`;
  const params = [];
  let paramCount = 1;

  if (filters.country) {
    query += ` AND l.country = $${paramCount}`;
    params.push(filters.country);
    paramCount++;
  }

  if (filters.source) {
    query += ` AND l.source = $${paramCount}`;
    params.push(filters.source);
    paramCount++;
  }

  if (filters.companyId) {
    query += ` AND l.company_id = $${paramCount}`;
    params.push(filters.companyId);
    paramCount++;
  }

  query += ' ORDER BY ls.total_score DESC NULLS LAST, l.created_at DESC';

  const result = await pool.query(query, params);
  return result.rows;
};

const getLeadById = async (id) => {
  const result = await pool.query(
    `SELECT l.*, c.name as company_name, c.industry FROM leads l
     LEFT JOIN companies c ON l.company_id = c.id
     WHERE l.id = $1`,
    [id]
  );
  return result.rows[0];
};

const checkDuplicateEmail = async (email) => {
  const result = await pool.query('SELECT id FROM leads WHERE email = $1', [email]);
  return result.rows.length > 0;
};

// ==================== LEAD SCORES ====================
const addLeadScore = async (leadId, companyId, scores) => {
  const { companyFrequencyScore, businessPotentialScore, industryScore, recencyScore, totalScore, scoreRank } = scores;

  const result = await pool.query(
    `INSERT INTO lead_scores (lead_id, company_id, company_frequency_score, business_potential_score, industry_score, recency_score, total_score, score_rank)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (lead_id) DO UPDATE SET
       company_frequency_score = $3, business_potential_score = $4, industry_score = $5,
       recency_score = $6, total_score = $7, score_rank = $8, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [leadId, companyId, companyFrequencyScore, businessPotentialScore, industryScore, recencyScore, totalScore, scoreRank]
  );
  return result.rows[0];
};

const getLeadScore = async (leadId) => {
  const result = await pool.query('SELECT * FROM lead_scores WHERE lead_id = $1', [leadId]);
  return result.rows[0];
};

// ==================== SEGMENTS ====================
const createSegment = async (name, description, criteria, country = null, industry = null) => {
  const result = await pool.query(
    `INSERT INTO segments (name, description, criteria, country, industry)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, description, JSON.stringify(criteria), country, industry]
  );
  return result.rows[0];
};

const getSegments = async () => {
  const result = await pool.query('SELECT * FROM segments ORDER BY created_at DESC');
  return result.rows;
};

const getSegmentById = async (id) => {
  const result = await pool.query('SELECT * FROM segments WHERE id = $1', [id]);
  return result.rows[0];
};

const addLeadToSegment = async (segmentId, leadId) => {
  try {
    await pool.query(
      `INSERT INTO segment_leads (segment_id, lead_id) VALUES ($1, $2)
       ON CONFLICT (segment_id, lead_id) DO NOTHING`,
      [segmentId, leadId]
    );
  } catch (err) {
    // Ignore duplicate key errors
    if (err.code !== '23505') throw err;
  }
};

const getSegmentLeads = async (segmentId) => {
  const result = await pool.query(
    `SELECT l.*, c.name as company_name, c.industry, ls.total_score
     FROM segment_leads sl
     JOIN leads l ON sl.lead_id = l.id
     LEFT JOIN companies c ON l.company_id = c.id
     LEFT JOIN lead_scores ls ON l.id = ls.lead_id
     WHERE sl.segment_id = $1
     ORDER BY ls.total_score DESC`,
    [segmentId]
  );
  return result.rows;
};

const updateSegmentLeadCount = async (segmentId) => {
  const result = await pool.query(
    `UPDATE segments SET lead_count = (SELECT COUNT(*) FROM segment_leads WHERE segment_id = $1)
     WHERE id = $1 RETURNING *`,
    [segmentId]
  );
  return result.rows[0];
};

module.exports = {
  // Imports
  addImport,
  getImports,
  // Companies
  getOrCreateCompany,
  getCompanies,
  getCompanyById,
  updateCompanyIndustry,
  updateCompanyContactCount,
  // Leads
  addLead,
  getLeads,
  getLeadById,
  checkDuplicateEmail,
  // Lead Scores
  addLeadScore,
  getLeadScore,
  // Segments
  createSegment,
  getSegments,
  getSegmentById,
  addLeadToSegment,
  getSegmentLeads,
  updateSegmentLeadCount,
};
