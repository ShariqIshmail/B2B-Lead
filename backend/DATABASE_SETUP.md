# Lead CRM Database Setup Guide

## Prerequisites

- PostgreSQL 12+ installed and running
- Node.js 16+
- Access to PostgreSQL command line or admin tool

## Step 1: Create PostgreSQL Database

Open PostgreSQL client (psql) or admin tool and run:

```sql
CREATE DATABASE lead_crm;
```

Verify it was created:
```sql
\l
```

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your PostgreSQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=lead_crm
   DB_USER=postgres
   DB_PASSWORD=your_actual_password
   ```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Initialize Database Schema

Run the initialization script:

```bash
node db/init.js
```

This will:
- Create all required tables
- Set up indexes for performance
- Display created tables

Expected output:
```
🔄 Initializing Lead CRM database...
✅ Database schema created successfully

📋 Created tables:
   • companies
   • imports
   • lead_scores
   • leads
   • segment_leads
   • segments

✨ Database initialization complete!
```

## Database Schema Overview

### **imports**
Tracks CSV file imports and metadata
- `id` - Import ID
- `file_name` - Original filename
- `imported_count` - Number of leads imported
- `imported_at` - Timestamp of import

### **companies**
Aggregated company data with industry classification
- `id` - Company ID
- `name` - Company name (unique)
- `domain` - Email domain
- `industry` - Industry vertical (Healthcare, Corporate, etc.)
- `industry_confidence` - Confidence score (0-1)
- `country` - US or Canada
- `contact_count` - Number of contacts from this company
- `last_updated` - Last update timestamp

### **leads**
Individual lead records
- `id` - Lead ID
- `company_id` - Foreign key to companies
- `first_name` - First name (parsed)
- `last_name` - Last name (parsed)
- `email` - Email address (unique)
- `phone` - Phone number
- `job_title` - Job title
- `country` - US or Canada
- `source` - Tradeshow, email campaign, etc.
- `import_id` - Reference to import batch

### **lead_scores**
Lead scoring based on multiple factors
- `id` - Score ID
- `lead_id` - Foreign key to leads
- `company_frequency_score` - Based on # of contacts from company
- `business_potential_score` - Based on industry/company fit
- `industry_score` - Industry relevance score
- `recency_score` - Based on how recent the lead is
- `total_score` - Combined score (used for ranking)
- `score_rank` - Rank among all leads

### **segments**
Email list segments/campaigns
- `id` - Segment ID
- `name` - Segment name (unique)
- `description` - Segment description
- `criteria` - JSON criteria for segment (stored as JSONB)
- `lead_count` - Number of leads in segment
- `country` - Optional: US/Canada filter
- `industry` - Optional: Industry filter

### **segment_leads**
Junction table linking leads to segments
- `segment_id` - Foreign key to segments
- `lead_id` - Foreign key to leads

## Query Examples

### Get all companies with lead counts
```sql
SELECT c.*, COUNT(l.id) as lead_count 
FROM companies c 
LEFT JOIN leads l ON c.id = l.company_id 
GROUP BY c.id 
ORDER BY lead_count DESC;
```

### Get top scored leads from a company
```sql
SELECT l.*, ls.total_score 
FROM leads l 
LEFT JOIN lead_scores ls ON l.id = ls.lead_id 
WHERE l.company_id = 1 
ORDER BY ls.total_score DESC;
```

### Get leads by country and industry
```sql
SELECT l.*, c.industry 
FROM leads l 
JOIN companies c ON l.company_id = c.id 
WHERE l.country = 'US' AND c.industry = 'Healthcare' 
ORDER BY l.created_at DESC;
```

## Resetting Database

To completely reset and reinitialize:

```bash
# In psql:
DROP DATABASE lead_crm;
CREATE DATABASE lead_crm;

# Then run init again:
node db/init.js
```

## Troubleshooting

### Connection Refused
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Check DB_HOST and DB_PORT

### Table Already Exists
- The schema script drops tables automatically, but if needed:
```sql
DROP TABLE IF EXISTS segment_leads, segment_items, lead_scores, leads, companies, imports CASCADE;
```

### Permission Denied
- Ensure your PostgreSQL user has permission to create tables
- May need SUPERUSER or CREATE role privileges

## Next Steps

1. Backend API endpoints will use these query functions
2. Lead import pipeline will populate `imports`, `companies`, and `leads` tables
3. Scoring engine will populate `lead_scores` table
4. Frontend will display and export data
