# Lead CRM - Quick Start Guide

A complete lead management and email CRM platform built with Node.js, React, and PostgreSQL.

## ✨ Features

✅ **Lead Import** - Upload CSV files from tradeshow lists and email campaigns  
✅ **Data Cleaning** - Auto-deduplication, validation, name parsing  
✅ **Company Aggregation** - Groups contacts by company with frequency-based scoring  
✅ **Lead Scoring** - Intelligent scoring based on company frequency and potential  
✅ **Industry Classification** - Auto-detects industries (Healthcare, Corporate, Hospitality, etc.)  
✅ **Geographic Segmentation** - Separate US and Canada leads  
✅ **Email Segments** - Create lists for targeted campaigns  
✅ **Export Functionality** - Export leads as CSV for sales reps  

## 🚀 Getting Started (5 minutes)

### 1. Prerequisites
- **Node.js** 16+ — [Download](https://nodejs.org/)
- **PostgreSQL** 12+ — [Download](https://www.postgresql.org/download/)
- **Git** 2.4+ — [Already installed]

### 2. Create Database

Open PostgreSQL (psql or admin tool) and run:
```sql
CREATE DATABASE lead_crm;
```

### 3. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL password
npm install
npm run init-db
npm start
```

Server runs on `http://localhost:5000`

Check health: `curl http://localhost:5000/health`

### 4. Setup Frontend

In a new terminal:
```bash
cd frontend
npm install
npm start
```

App opens at `http://localhost:3000`

## 📊 Using the App

### Upload Leads

1. Click **Upload** tab
2. Select CSV file with these columns:
   - `email` (required, unique)
   - `name` (parsed to first/last)
   - `company` (required)
   - `phone` (optional)
   - `title` (optional)
   - `country` (US/Canada, optional)
   - `source` (tradeshow/campaign/etc.)

3. Click "Upload & Process"
4. Leads are cleaned, scored, and indexed

### View Dashboard

**Dashboard** shows:
- Total leads and average score
- Breakdown by country, industry, source
- Top 50 leads (scored by frequency)
- Filter by country and source

### Manage Companies

**Companies** tab shows:
- All companies with contact counts
- Industry classification
- Click any company for details

### Create Email Segments

**Segments** tab:
- Create segments (filtered lists for campaigns)
- Tag by country, industry, or criteria
- Export as CSV for email campaigns

### Export Data

From any page:
- **Dashboard** → Export all leads as CSV
- **Segments** → Export segment as CSV
- Leads are ordered by score (best first)

## 🗄️ Database Schema

```
companies (industry, contact count)
  ├─ leads (name, email, phone, job title)
  │  └─ lead_scores (frequency score, business potential, etc.)
  │
imports (tracks CSV uploads)
  └─ leads (historical tracking)

segments (email campaigns)
  └─ segment_leads (many-to-many junction)
```

## 📡 API Endpoints

### Leads
- `GET /api/leads` — Get all leads (with filters)
- `GET /api/leads/stats/overview` — Stats overview
- `POST /api/leads/export/csv` — Export as CSV

### Companies
- `GET /api/companies` — Get all companies
- `GET /api/companies/stats/industries` — Industry breakdown

### Segments
- `GET /api/segments` — Get all segments
- `POST /api/segments` — Create segment
- `GET /api/segments/:id/export` — Export segment as CSV

### Imports
- `POST /api/imports/upload` — Upload and process CSV

## 📋 CSV Format Example

```csv
email,name,company,phone,title,country,source
john.smith@example.com,John Smith,Example Corp,555-1234,Sales Manager,US,tradeshow
jane.doe@acme.com,Jane Doe,ACME Inc,555-5678,Marketing Director,US,email-campaign
bob.wilson@health.ca,Bob Wilson,Health Solutions,555-9999,CTO,Canada,tradeshow
```

## ⚙️ Configuration

Edit `.env` in backend folder:
```
PORT=5000                    # API port
DB_HOST=localhost            # PostgreSQL host
DB_PORT=5432                 # PostgreSQL port
DB_NAME=lead_crm             # Database name
DB_USER=postgres             # PostgreSQL user
DB_PASSWORD=your_password    # Your password
```

## 🔧 Development

Start with live reload:
```bash
# Backend (with nodemon)
cd backend && npm run dev

# Frontend (with React dev server)
cd frontend && npm start
```

## 📊 Scoring Algorithm

Leads are scored based on:

1. **Company Frequency** (0-100 points)
   - More contacts from same company = higher score
   - 5 contacts = 50 points, 10+ = 100 points

2. **Business Potential** (0-100 points)
   - Based on industry fit and company size

3. **Industry Relevance** (0-100 points)
   - Auto-detected from company name/domain

4. **Recency** (0-100 points)
   - New imports get higher scores

**Total Score** = Average of all factors

## 🎯 Workflow

```
1. Upload CSV
       ↓
2. System cleans & parses names
       ↓
3. Companies aggregated & industry detected
       ↓
4. Leads scored & ranked
       ↓
5. View on dashboard
       ↓
6. Create segments
       ↓
7. Export for email campaigns
```

## 🔍 Example Workflows

### Tradeshow Follow-up
1. Upload tradeshow attendee list
2. View high-scored leads (most valuable companies)
3. Create segment: "Tradeshow - High Potential"
4. Export for email campaign

### Industry Targeting
1. Upload mixed lead list
2. Filter by industry (Healthcare, Hospitality, etc.)
3. Create segment: "Healthcare - US"
4. Export for targeted outreach

### Geographic Split
1. Upload combined list
2. Create segments: "US Leads" and "Canada Leads"
3. Assign to regional reps
4. Export for each team

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
psql -U postgres

# Verify database exists
\l | grep lead_crm

# Run initialization again
npm run init-db
```

### Frontend won't connect
- Ensure backend is running on port 5000
- Check `npm start` output for errors
- Clear browser cache (Ctrl+Shift+Delete)

### Duplicate email errors
- CSV contains same email twice
- Email already exists from previous import
- Duplicates are automatically skipped

### Industry detection not working
- Company name doesn't match keywords
- Check industry manually in Companies tab
- Web lookup will improve over time

## 📚 Project Structure

```
lead-crm/
├── backend/
│   ├── db/
│   │   ├── schema.sql          # Database tables
│   │   ├── init.js             # Initialization script
│   │   ├── queries.js          # Query functions
│   │   └── connection.js       # PostgreSQL pool
│   ├── routes/
│   │   ├── leads.js            # Lead endpoints
│   │   ├── companies.js        # Company endpoints
│   │   ├── segments.js         # Segment endpoints
│   │   └── imports.js          # Import/upload endpoint
│   ├── utils/
│   │   └── dataProcessing.js   # Cleaning, parsing, scoring
│   ├── server.js               # Express app
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── App.js              # Main app
│   │   └── App.css             # Styles
│   └── package.json
├── BACKEND_SETUP.md            # Backend guide
├── README.md                   # Main README
└── QUICKSTART.md               # This file
```

## 🚀 Next Steps

- **Add more companies?** Upload more CSV files
- **Customize scoring?** Edit `scoreLeadByFrequency()` in `backend/routes/imports.js`
- **Add integrations?** Extend API endpoints for Mailchimp, HubSpot, etc.
- **Monthly reminders?** Add cron jobs to scheduled imports
- **Rep assignment?** Add territory/region logic to segments

## 📞 Support

Check logs:
```bash
# Backend errors
npm start  # Shows console output

# Database queries
psql -d lead_crm
SELECT * FROM leads LIMIT 5;
```

Review guides:
- `BACKEND_SETUP.md` — Database & backend details
- `DATABASE_SETUP.md` — SQL schema reference
- API routes in `backend/routes/`

---

**Version 0.1.0** • Built with ❤️ for smarter lead management
