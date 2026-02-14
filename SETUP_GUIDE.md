# 🚀 Medihack Setup Guide - Full Stack

Complete setup instructions for running the Nurse Competency Assessment platform.

## 📁 Project Structure

```
medihack/
├── frontend/           # React frontend
│   ├── components/
│   ├── services/
│   └── package.json
├── backend/            # Node.js backend
│   ├── src/
│   ├── prisma/
│   └── package.json
└── package.json        # Root convenience scripts
```

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** (comes with Node.js)

## 🗄️ Database Setup

### 1. Install PostgreSQL

**Windows:** Download installer from https://www.postgresql.org/download/windows/

**macOS:** 
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE medihack;

# Exit
\q
```

## 🔧 Installation

### Option 1: Install All at Once (Recommended)

From the root directory:

```bash
npm run install:all
```

This installs dependencies for both frontend and backend.

### Option 2: Manual Installation

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

## ⚙️ Configuration

### Backend Environment Variables

Edit `backend/.env`:

```env
# Database Connection
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/medihack?schema=public"

# JWT Secret (change to random string)
JWT_SECRET="change-this-to-a-random-secret-key-abc123xyz789"

# Gemini API Key
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"

# Server Config
PORT=3001
NODE_ENV=development
```

**Important:**
- Replace `YOUR_PASSWORD` with your PostgreSQL password
- Generate a secure random string for `JWT_SECRET`
- Get Gemini API key from https://aistudio.google.com/app/apikey

### Frontend Configuration

No `.env` file needed! The frontend connects to backend at `http://localhost:3001` by default.

To change the API URL, edit `frontend/services/apiService.ts`:
```typescript
const API_URL = 'http://your-backend-url:port/api';
```

## 🗃️ Initialize Database

From the backend directory:

```bash
cd backend
npm run db:push
```

This creates all database tables based on the Prisma schema.

✅ You should see: `"Your database is now in sync with your Prisma schema."`

## 🚀 Start Development Servers

### Option 1: Run Both at Once (Recommended)

From the root directory:

```bash
npm install  # Installs concurrently
npm run dev
```

This starts both frontend and backend simultaneously.

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on **http://localhost:3001**

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on **http://localhost:5173**

## ✅ Verify Installation

1. **Backend Health Check**  
   Open: http://localhost:3001/api/health  
   Should show: `{"status":"ok","message":"Medihack Backend API is running"}`

2. **Frontend**  
   Open: http://localhost:5173  
   Should show the login page

3. **Create Test Account**  
   - Username: `test_nurse`
   - Password: (optional)
   - Experience: `3` years
   - Click "Start Assessment"

## 📊 View Database

To browse your data with Prisma Studio:

```bash
cd backend
npm run db:studio
```

Opens at **http://localhost:5555** - you can view and edit all database records.

## 🔐 Security Setup

### 1. Revoke Old API Key

The old frontend `.env.local` file exposed your API key. Revoke it:
1. Go to https://aistudio.google.com/app/apikey
2. Delete the old key
3. Generate a new one
4. Add it to `backend/.env`

### 2. Update JWT Secret

Change the `JWT_SECRET` in `backend/.env` to a random string:
```bash
# Generate random secret (one of these):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Or use: https://www.uuidgenerator.net/
```

## 📁 Directory Structure Explained

```
medihack/
├── frontend/                    # React application
│   ├── components/
│   │   ├── Login.tsx           # Login page
│   │   ├── Assessment.tsx      # Main assessment
│   │   ├── Dashboard.tsx       # Results view
│   │   ├── Report.tsx          # IDP report
│   │   └── Avatar.tsx          # AI avatar UI
│   ├── services/
│   │   └── apiService.ts       # Backend API calls
│   ├── types.ts                # TypeScript interfaces
│   ├── constants.ts            # App constants
│   ├── package.json            # Frontend dependencies
│   └── vite.config.ts          # Vite configuration
│
├── backend/                     # Express API server
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts         # Login/register
│   │   │   ├── assessment.ts   # Assessment APIS
│   │   │   └── user.ts         # User profile
│   │   ├── middleware/
│   │   │   └── auth.ts         # JWT middleware
│   │   └── server.ts           # Entry point
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── package.json            # Backend dependencies
│   └── .env                    # Environment variables
│
├── package.json                 # Root convenience scripts
├── README.md                    # Project overview
└── SETUP_GUIDE.md              # This file
```

## 🐛 Troubleshooting

### Backend Won't Start

**Problem:** `Error: connect ECONNREFUSED`
- **Solution:** Check if PostgreSQL is running
  ```bash
  psql -U postgres
  ```

**Problem:** `Error: P1001: Can't reach database server`
- **Solution:** Verify `DATABASE_URL` in `backend/.env`
- Check PostgreSQL is running on the correct port (default: 5432)

**Problem:** `Error: Cannot find module '@prisma/client'`
- **Solution:** Run `npm run db:push` in backend directory

### Frontend API Errors

**Problem:** `Failed to fetch` or CORS errors
- **Solution:** Ensure backend is running on port 3001
- Check browser console for exact error
- Verify `API_URL` in `frontend/services/apiService.ts`

**Problem:** `401 Unauthorized` errors
- **Solution:** Clear browser localStorage and log in again
  ```javascript
  // In browser console:
  localStorage.clear();
  location.reload();
  ```

### Database Issues

**Problem:** Tables not created
- **Solution:** Run database push again
  ```bash
  cd backend
  npm run db:push
  ```

**Problem:** Connection refused
- **Solution:** Check PostgreSQL status
  ```bash
  # macOS/Linux
  sudo systemctl status postgresql
  
  # Windows - Services app
  # Check if "postgresql" service is running
  ```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use`
- **Solution:** Change port in `backend/.env`:
  ```env
  PORT=3002
  ```
- Also update frontend `apiService.ts` to match

## 🚀 What's New with Backend?

✅ **Data Persistence** - All assessments saved to PostgreSQL  
✅ **User Authentication** - Secure JWT-based login  
✅ **Assessment History** - View all past results  
✅ **Progress Tracking** - Compare scores across time  
✅ **Secure API** - Gemini key hidden from browser  
✅ **IDP Archive** - Store all development plans  
✅ **Session Management** - Track assessment workflows  

## 🎯 Next Steps

After successful setup:

1. **Test the Assessment Flow**
   - Create a user account
   - Complete one competency assessment
   - View results on dashboard
   - Check database in Prisma Studio

2. **Explore the Database**
   ```bash
   npm run db:studio
   ```
   - Browse users, sessions, results
   - See how data is structured

3. **Customize the App**
   - Modify competencies in `frontend/constants.ts`
   - Adjust scoring logic in backend
   - Customize UI in components

4. **Deploy to Production**
   - See deployment guides in README.md
   - Use environment variables for production
   - Set up managed PostgreSQL database

## 📚 Additional Resources

- [Frontend README](frontend/README.md) - React app documentation
- [Backend README](backend/README.md) - API reference
- [Prisma Docs](https://www.prisma.io/docs) - Database ORM
- [Gemini API](https://ai.google.dev/docs) - AI integration

## 🆘 Need Help?

1. Check error messages carefully
2. Review browser console (F12)
3. Check backend terminal for errors
4. Verify all environment variables are set
5. Ensure PostgreSQL is running

## 🎉 Success!

Once everything is running:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Database UI: http://localhost:5555

Happy coding! 🚀
