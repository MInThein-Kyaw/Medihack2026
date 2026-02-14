# Medihack Backend API

Backend server for the Nurse Competency Assessment platform.

## Tech Stack

- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** database
- **Prisma** ORM
- **JWT** authentication
- **Google Gemini AI** integration

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Database

Install PostgreSQL and create a database:

```sql
CREATE DATABASE medihack;
```

Update `.env` file with your database connection:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/medihack?schema=public"
```

### 3. Initialize Database

```bash
npm run db:push
```

This will create all tables based on the Prisma schema.

### 4. Start Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

Server will run on `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Assessment

- `POST /api/assessment/session/start` - Start new assessment session
- `POST /api/assessment/scenarios/generate` - Generate questions (AI)
- `POST /api/assessment/evaluate` - Evaluate responses and save to DB
- `POST /api/assessment/voice` - Generate voice feedback
- `POST /api/assessment/session/complete` - Complete session
- `GET /api/assessment/session/:id/results` - Get session results

### User

- `GET /api/user/profile` - Get user profile
- `GET /api/user/progress` - Get competency progress
- `GET /api/user/history` - Get assessment history

## Database Schema

- **users** - User accounts
- **assessment_sessions** - Assessment sessions
- **assessment_results** - Scores per competency
- **question_responses** - Individual Q&A pairs
- **idp_plans** - Development plans
- **progress_tracking** - Performance over time

## View Database

```bash
npm run db:studio
```

Opens Prisma Studio at `http://localhost:5555`
