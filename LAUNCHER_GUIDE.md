# Lead CRM - Windows Launcher Scripts

Quick-launch batch scripts to manage your Lead CRM application.

## Scripts Overview

### 🚀 START.bat
**Main launcher - Use this to run the app**

```
START.bat
```

**What it does:**
1. Checks if Node.js is installed
2. Verifies backend folder exists
3. Verifies frontend folder exists
4. Starts backend server (port 5000) in a new command window
5. Starts frontend server (port 3000) in a new command window
6. Opens the app in your default browser (http://localhost:3000)

**When to use:**
- Daily app usage
- After restarting your computer
- After stopping the app

### ⚡ START_FAST.bat
**Faster launcher - skips checks**

```
START_FAST.bat
```

**What it does:**
- Same as START.bat but skips Node.js and folder verification
- Faster startup (2-3 seconds saved)

**When to use:**
- When you know everything is already installed
- Quick restarts during development

### 🔧 SETUP.bat
**One-time setup script**

```
SETUP.bat
```

**What it does:**
1. Checks Node.js installation
2. Checks PostgreSQL installation
3. Installs backend dependencies (`npm install`)
4. Installs frontend dependencies (`npm install`)
5. Initializes database (`npm run init-db`)

**When to use:**
- **First time only** after downloading the project
- After adding new dependencies
- If you get "module not found" errors

**Important:** Before running SETUP.bat:
1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create database: `CREATE DATABASE lead_crm;`
3. Edit `backend\.env` with your PostgreSQL password
4. Make sure PostgreSQL is running

### 🛑 STOP.bat
**Stop the running application**

```
STOP.bat
```

**What it does:**
1. Kills all Node.js processes
2. Closes the backend window
3. Closes the frontend window

**When to use:**
- When you want to shut down the app
- Before restarting
- Before updating code

## Quick Start Guide

### First Time Setup

```batch
1. Open command prompt in the lead-crm folder
2. Run: SETUP.bat
3. Wait for setup to complete (2-3 minutes)
4. Edit backend\.env with your database password
5. Run: START.bat
```

### Daily Usage

```batch
1. Double-click: START.bat
2. App opens automatically in browser
3. When done, run: STOP.bat
```

### Development

```batch
# First time
SETUP.bat

# Daily work
START.bat          # Start app
# ... make changes ...
STOP.bat           # Stop when done
START_FAST.bat     # Restart quickly
```

## What Happens When You Run START.bat

### Command Windows
Two new command windows will open:

**Window 1: "Lead CRM Backend"**
```
[nodemon] starting `node server.js`
🚀 Server running on http://localhost:5000
📊 Lead Management & Email CRM Tool
```

**Window 2: "Lead CRM Frontend"**
```
Compiled successfully!

You can now view lead-crm in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000

Note that the development build is not optimized.
```

**Browser**
Opens automatically to http://localhost:3000 with the dashboard

### Ports Used
- **Backend API:** http://localhost:5000
- **Frontend App:** http://localhost:3000
- **Database:** localhost:5432 (PostgreSQL)

## Stopping the App

### Option 1: STOP.bat
```batch
STOP.bat
```

### Option 2: Manual
1. Close the "Lead CRM Backend" window
2. Close the "Lead CRM Frontend" window
3. Close the browser tab

## Troubleshooting

### "Node.js not found"
```
ERROR: Node.js is not installed or not on PATH
```

**Fix:**
1. Install Node.js: https://nodejs.org/
2. Restart your computer (or logout/login)
3. Run START.bat again

### "backend folder not found"
```
ERROR: backend folder not found
```

**Fix:**
1. Make sure you're running START.bat from the `lead-crm` folder
2. The folder structure should be:
   ```
   lead-crm/
   ├── backend/
   ├── frontend/
   ├── START.bat
   └── ...
   ```

### Database connection error
```
ERROR: connect ECONNREFUSED 127.0.0.1:5432
```

**Fix:**
1. Make sure PostgreSQL is running
2. Edit `backend\.env` with correct credentials
3. Run `SETUP.bat` to initialize database

### Port already in use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Fix:**
- Another application is using port 5000 or 3000
- Run `STOP.bat` to kill processes
- Or change ports in `.env` file

### npm command not found
```
'npm' is not recognized as an internal or external command
```

**Fix:**
1. Install Node.js: https://nodejs.org/
2. Restart command prompt
3. Run `node -v` to verify installation

## Advanced Usage

### Custom Ports

Edit `backend\.env`:
```
PORT=5001  # Change backend port
```

Then update `frontend\src\App.js`:
```javascript
fetch('http://localhost:5001/health')  // Change port here
```

### Environment Variables

Edit `backend\.env`:
```
NODE_ENV=development    # development or production
DB_HOST=localhost       # PostgreSQL host
DB_PORT=5432           # PostgreSQL port
DB_NAME=lead_crm       # Database name
DB_USER=postgres       # PostgreSQL user
DB_PASSWORD=xxx        # Your password
```

### Debugging

To see more detailed logs, edit START.bat and change:
```batch
npm start
```
To:
```batch
npm run dev
```

## Batch File Locations

Place all .bat files in the root `lead-crm` folder:

```
C:\Users\svr07\OneDrive\Desktop\Business\lead-crm\
├── START.bat              ← Main launcher
├── START_FAST.bat         ← Quick launcher
├── SETUP.bat              ← One-time setup
├── STOP.bat               ← Stop servers
├── LAUNCHER_GUIDE.md      ← This file
├── backend/
└── frontend/
```

## Creating Shortcuts

### Desktop Shortcut for START.bat

1. Right-click desktop → New → Shortcut
2. Location: `C:\Users\svr07\OneDrive\Desktop\Business\lead-crm\START.bat`
3. Name: "Lead CRM"
4. Right-click shortcut → Properties
5. Change icon (optional): Click "Change Icon" button
6. Click OK

Now you can double-click the shortcut to start the app!

### Windows Startup (Optional)

To auto-start when you log in:

1. Press `Win+R`
2. Type: `shell:startup`
3. Copy START.bat shortcut into this folder
4. App will auto-start on next login

## Common Commands

```batch
# Setup everything (one time)
SETUP.bat

# Start the app
START.bat

# Fast restart (already installed)
START_FAST.bat

# Stop the app
STOP.bat

# Manual commands (if needed)
cd backend && npm install  # Install backend only
cd frontend && npm install # Install frontend only
cd backend && npm run init-db  # Initialize database only
```

## Tips & Tricks

### Auto-restart on code changes
```batch
# Backend already auto-restarts (nodemon enabled)
# Frontend automatically restarts on save
```

### Check if ports are in use
```batch
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

### Kill process by port
```batch
# For port 5000
for /f "tokens=5" %a in ('netstat -ano ^| findstr :5000') do taskkill /PID %a /F

# For port 3000
for /f "tokens=5" %a in ('netstat -ano ^| findstr :3000') do taskkill /PID %a /F
```

---

**Need help?** See:
- QUICKSTART.md — App usage guide
- BACKEND_SETUP.md — Backend configuration
- README.md — Project overview
