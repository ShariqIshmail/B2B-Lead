-- Lead CRM Database Schema

-- Drop existing tables (if they exist)
DROP TABLE IF EXISTS lead_scores CASCADE;
DROP TABLE IF EXISTS segment_leads CASCADE;
DROP TABLE IF EXISTS segments CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS imports CASCADE;

-- Imports table (tracks CSV imports)
CREATE TABLE imports (
  id SERIAL PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  imported_count INT DEFAULT 0,
  imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Companies table (aggregated company data)
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  domain VARCHAR(255),
  industry VARCHAR(100),
  industry_confidence DECIMAL(3, 2) DEFAULT 0.5,
  country VARCHAR(50),
  contact_count INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table (individual lead records)
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  job_title VARCHAR(100),
  country VARCHAR(50),
  source VARCHAR(100),
  import_id INT REFERENCES imports(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lead scores table (scoring details)
CREATE TABLE lead_scores (
  id SERIAL PRIMARY KEY,
  lead_id INT UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
  company_id INT REFERENCES companies(id),
  company_frequency_score DECIMAL(5, 2) DEFAULT 0,
  business_potential_score DECIMAL(5, 2) DEFAULT 0,
  industry_score DECIMAL(5, 2) DEFAULT 0,
  recency_score DECIMAL(5, 2) DEFAULT 0,
  total_score DECIMAL(5, 2) DEFAULT 0,
  score_rank INT,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Segments table (email list segments)
CREATE TABLE segments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  criteria JSONB,
  lead_count INT DEFAULT 0,
  country VARCHAR(50),
  industry VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Segment leads junction table (many-to-many)
CREATE TABLE segment_leads (
  id SERIAL PRIMARY KEY,
  segment_id INT REFERENCES segments(id) ON DELETE CASCADE,
  lead_id INT REFERENCES leads(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(segment_id, lead_id)
);

-- Indexes for performance
CREATE INDEX idx_leads_company_id ON leads(company_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_country ON leads(country);
CREATE INDEX idx_leads_import_id ON leads(import_id);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_country ON companies(country);
CREATE INDEX idx_companies_domain ON companies(domain);
CREATE INDEX idx_lead_scores_lead_id ON lead_scores(lead_id);
CREATE INDEX idx_lead_scores_total_score ON lead_scores(total_score DESC);
CREATE INDEX idx_segment_leads_segment_id ON segment_leads(segment_id);
CREATE INDEX idx_segment_leads_lead_id ON segment_leads(lead_id);
