# Lead Management & Email CRM Tool

A comprehensive lead management system designed to help you import, clean, score, and segment leads from tradeshow and email campaigns. Organizes leads by company, industry vertical, and geography (US/Canada) for efficient sales rep engagement.

## Features

- **Lead Import**: Monthly automated prompts to import leads from CSV files
- **Data Cleaning**: Auto-deduplication, validation, and name parsing (first/last name separation)
- **Company Aggregation**: Groups contacts by company name and email domain
- **Lead Scoring**: Scores leads based on company frequency and business likelihood
- **Industry Classification**: Auto-detects industry vertical with web lookup (Healthcare, Corporate, Hospitality, Education, etc.)
- **Geographic Segmentation**: Separates US and Canada demographics
- **Email Database**: Persistent storage for organized email list management
- **Rep Packaging**: Exports clean, segmented lists ready for sales campaigns

## Tech Stack

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React
- **Database**: PostgreSQL
- **Automation**: Scheduled monthly import reminders

## Project Structure

```
lead-crm/
├── backend/          # Node.js server & API
├── frontend/         # React web app
├── README.md
└── .gitignore
```

## Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL
- Git

### Installation

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npx create-react-app .
   ```

3. **Database Setup**
   - Create PostgreSQL database
   - Update `.env` with database credentials

4. **Run Backend**
   ```bash
   npm start
   ```

5. **Run Frontend**
   ```bash
   cd frontend
   npm start
   ```

## API Endpoints (TBD)

- `POST /api/leads/upload` - Upload CSV file
- `GET /api/leads` - Get all leads
- `GET /api/companies` - Get company aggregates
- `POST /api/segments` - Create email segments
- `GET /api/export` - Export lists for campaigns

## Database Schema (TBD)

- **leads** - Individual lead records
- **companies** - Company aggregates and industry classification
- **segments** - Email list segments
- **imports** - Import history tracking

## License

Private
