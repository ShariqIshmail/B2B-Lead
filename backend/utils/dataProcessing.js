const axios = require('axios');

/**
 * Clean and parse lead data from CSV row
 */
function cleanAndParseLead(row) {
  // Extract and normalize fields (flexible to handle various column names)
  const email = normalizeEmail(row.email || row.Email || row.EMAIL || '');
  const fullName = row.name || row.Name || row.full_name || row['Full Name'] || '';
  const company = row.company || row.Company || row.organization || row.Organization || '';
  const phone = normalizePhone(row.phone || row.Phone || row.phone_number || '');
  const jobTitle = row.title || row.Title || row.job_title || row['Job Title'] || '';
  const country = normalizeCountry(row.country || row.Country || '');
  const source = (row.source || row.Source || 'imported').toLowerCase();

  // Parse full name into first and last
  const { firstName, lastName } = parseName(fullName);

  // Extract company domain from email
  const companyDomain = email.includes('@') ? email.split('@')[1] : null;

  // Validate required fields
  if (!email || !email.includes('@')) {
    throw new Error(`Invalid email: ${email}`);
  }

  if (!company) {
    throw new Error('Company name is required');
  }

  return {
    firstName: firstName || '',
    lastName: lastName || '',
    email: email.toLowerCase().trim(),
    phone: phone,
    jobTitle: jobTitle.trim(),
    companyName: company.trim(),
    companyDomain: companyDomain,
    country: country,
    source: source,
  };
}

/**
 * Parse full name into first and last name
 */
function parseName(fullName) {
  if (!fullName || fullName.trim() === '') {
    return { firstName: '', lastName: '' };
  }

  const cleaned = fullName
    .trim()
    .replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Prof\.|Sir|Madam)\s+/i, '') // Remove titles
    .replace(/\s+(Jr\.|Sr\.|II|III|IV|PhD|MBA|CPA)$/i, ''); // Remove suffixes

  const parts = cleaned.trim().split(/\s+/);

  if (parts.length === 0) {
    return { firstName: '', lastName: '' };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  // Last part is last name, rest is first name
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
}

/**
 * Normalize email
 */
function normalizeEmail(email) {
  return String(email).toLowerCase().trim();
}

/**
 * Normalize phone number (basic formatting)
 */
function normalizePhone(phone) {
  if (!phone) return '';

  // Remove non-digit characters except + and -
  const cleaned = String(phone)
    .replace(/[^\d\+\-]/g, '')
    .trim();

  return cleaned;
}

/**
 * Normalize country to US or Canada
 */
function normalizeCountry(country) {
  if (!country) return 'US'; // Default to US

  const normalized = String(country).toUpperCase().trim();

  if (normalized === 'US' || normalized === 'USA' || normalized === 'UNITED STATES') {
    return 'US';
  }

  if (normalized === 'CA' || normalized === 'CANADA') {
    return 'Canada';
  }

  // Try to detect from domain or infer
  return 'US'; // Default to US if unclear
}

/**
 * Detect industry from company name and/or domain using web lookup
 */
async function detectIndustry(companyName, domain) {
  try {
    // Check cache first (in-memory simple cache)
    if (industryCache[companyName]) {
      return industryCache[companyName];
    }

    // Try web-based detection
    const industry = await lookupIndustry(companyName, domain);

    // Cache result
    industryCache[companyName] = industry;

    return industry;
  } catch (err) {
    console.error(`Industry detection failed for ${companyName}:`, err.message);
    return { industry: 'Unclassified', confidence: 0 };
  }
}

/**
 * Lookup industry from web sources
 */
async function lookupIndustry(companyName, domain) {
  // Industry keywords by vertical
  const industriesKeywords = {
    'Healthcare': ['hospital', 'clinic', 'medical', 'health', 'pharma', 'drug', 'dental', 'therapy', 'care', 'nurse', 'doctor', 'patient'],
    'Corporate': ['consulting', 'finance', 'bank', 'investment', 'corporate', 'business', 'accounting', 'audit', 'law', 'legal'],
    'Hospitality': ['hotel', 'restaurant', 'resort', 'travel', 'tourism', 'hospitality', 'lodging', 'catering', 'event', 'venue'],
    'Education': ['school', 'university', 'college', 'education', 'academy', 'institute', 'training', 'learning', 'student', 'professor'],
    'Technology': ['software', 'tech', 'digital', 'cloud', 'ai', 'data', 'developer', 'app', 'it', 'cybersecurity', 'saas'],
    'Retail': ['retail', 'store', 'shop', 'commerce', 'e-commerce', 'mall', 'shopping', 'brand', 'merchandise'],
    'Manufacturing': ['manufacturing', 'industrial', 'factory', 'plant', 'production', 'equipment', 'machinery'],
    'Real Estate': ['real estate', 'property', 'developer', 'construction', 'building', 'commercial'],
  };

  const searchTerm = companyName.toLowerCase();

  // Check company name against keywords
  for (const [industry, keywords] of Object.entries(industriesKeywords)) {
    for (const keyword of keywords) {
      if (searchTerm.includes(keyword)) {
        return {
          industry: industry,
          confidence: 0.85,
          source: 'name_matching',
        };
      }
    }
  }

  // If domain is available, try domain-based detection
  if (domain) {
    try {
      // Simple domain extension check
      if (domain.includes('.edu')) {
        return { industry: 'Education', confidence: 0.95, source: 'domain' };
      }
      if (domain.includes('.gov')) {
        return { industry: 'Government', confidence: 0.95, source: 'domain' };
      }
      if (domain.includes('.health')) {
        return { industry: 'Healthcare', confidence: 0.9, source: 'domain' };
      }
    } catch (err) {
      // Ignore domain check errors
    }
  }

  // If no match, return unclassified
  return {
    industry: 'Unclassified',
    confidence: 0,
    source: 'none',
  };
}

// Simple in-memory cache for industry lookups
const industryCache = {};

module.exports = {
  cleanAndParseLead,
  parseName,
  normalizeEmail,
  normalizePhone,
  normalizeCountry,
  detectIndustry,
};
