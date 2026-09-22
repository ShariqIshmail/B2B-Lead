# Backend Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js 16+ installed
- PostgreSQL 12+ installed and running
- PostgreSQL credentials (username and password)

### 2. Create PostgreSQL Database

Open PostgreSQL admin tool or command line and create the database:

```sql
CREATE DATABASE lead_crm;
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment

Copy the example env file and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env` and set:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lead_crm
DB_USER=postgres
DB_PASSWORD=your_actual_password
```

### 5. Initialize Database Schema

```bash
npm run init-db
```

This will create all tables, indexes, and relationships. Output should show:
```
✅ Database schema created successfully

📋 Created tables:
   • companies
   • imports
   • lead_scores
   • leads
   • segment_leads
   • segments
```

### 6. Start Backend Server

```bash
npm start
```

Server will run on `http://localhost:5000`

Check health:
```
curl http://localhost:5000/health
```

## Database Architecture

### Tables Overview

| Table | Purpose |
|-------|---------|
| **imports** | Tracks CSV file imports |
| **companies** | Aggregated company data with industry classification |
| **leads** | Individual lead records with parsed names |
| **lead_scores** | Lead scoring based on frequency & potential |
| **segments** | Email list segments/campaigns |
| **segment_leads** | Junction table linking leads to segments |

### Key Relationships

```
imports
  └─ leads (import_id)

companies
  └─ leads (company_id)
  └─ lead_scores (company_id)

leads
  ├─ lead_scores (1:1)
  └─ segment_leads (1:many)
      └─ segments

segments
  └─ segment_leads (1:many)
      └─ leads
```

## Available Endpoints (Current)

### Health Check
```
GET /health
```
Returns database connection status

### Database Info
```
GET /api/database-info
```
Lists all created tables

## Upcoming Endpoints

- `POST /api/leads/upload` - Upload CSV file
- `GET /api/leads` - Get leads with filters
- `GET /api/companies` - Get company aggregates
- `POST /api/segments` - Create email segment
- `GET /api/export` - Export leads for campaigns

## Database Queries (Using db/queries.js)

The `db/queries.js` file provides pre-built query functions:

```javascript
const {
  // Imports
  addImport,
  getImports,
  // Companies
  getOrCreateCompany,
  getCompanies,
  updateCompanyIndustry,
  // Leads
  addLead,
  getLeads,
  checkDuplicateEmail,
  // Lead Scores
  addLeadScore,
  getLeadScore,
  // Segments
  createSegment,
  getSegments,
  addLeadToSegment,
  getSegmentLeads,
} = require('./db/queries');
```

## Development

Start with live reload:
```bash
npm run dev
```

Requires nodemon (already in devDependencies)

## Troubleshooting

### "Cannot connect to database"
- Ensure PostgreSQL is running
- Check credentials in `.env`
- Run: `psql -U postgres` to verify PostgreSQL works

### "Database 'lead_crm' does not exist"
- Create it: `CREATE DATABASE lead_crm;`
- Run: `npm run init-db`

### "Tables don't exist after init"
- Check PostgreSQL logs for SQL errors
- Verify you're using the right database: `\c lead_crm` in psql
- Manually run: `psql -U postgres -d lead_crm < db/schema.sql`

## File Structure

```
backend/
├── server.js              # Express server
├── package.json           # Dependencies
├── .env.example          # Environment template
├── db/
│   ├── connection.js     # PostgreSQL pool
│   ├── schema.sql        # Database schema
│   ├── init.js           # Initialization script
│   └── queries.js        # Query helper functions
├── routes/               # API routes (TBD)
│   ├── leads.js
│   ├── companies.js
│   └── segments.js
└── DATABASE_SETUP.md     # Detailed database guide
```

## Next Steps

1. ✅ Database schema created
2. ⏭️ Build API routes (leads, companies, segments)
3. ⏭️ Lead import & cleaning pipeline
4. ⏭️ Lead scoring engine
5. ⏭️ Industry classification with web lookup
6. ⏭️ Connect frontend to API
