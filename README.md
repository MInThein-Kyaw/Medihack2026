# Nurse AI Avatar Competency Assessment

AI-powered competency assessment platform for nurses with voice-enabled avatar interactions, real-time evaluation, and personalized development plans.

## 🎯 Features

- **Voice-Enabled Assessment** - Speak or type answers to AI-generated scenarios
- **Adaptive Difficulty** - Questions adjust to nurse experience level (1-5+ years)
- **Batch Evaluation** - Answer 3 questions per competency, then get overall review
- **Short Voice Summaries** - AI speaks concise feedback
- **6 Competency Areas** - Functional, Specific, and Managerial competencies
- **Real-time Scoring** - 0-4 scale with gap analysis
- **IDP Generation** - Personalized development plans
- **Bilingual Support** - Thai & English
- **Full Backend** - PostgreSQL database with authentication

## 🏗️ Project Structure

```
medihack/
├── frontend/           # React + TypeScript + Vite
│   ├── components/     # React components
│   ├── services/       # API service layer
│   ├── types.ts        # TypeScript definitions
│   └── package.json
├── backend/            # Node.js + Express + PostgreSQL
│   ├── src/
│   │   ├── routes/     # API endpoints
│   │   ├── middleware/ # Auth middleware
│   │   └── server.ts   # Entry point
│   ├── prisma/         # Database schema
│   └── package.json
├── package.json        # Root scripts for convenience
└── SETUP_GUIDE.md      # Complete setup instructions
```

## 🚀 Quick Start

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for complete setup instructions.

### One-Command Install

```bash
npm run install:all
```

### Start Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Or use the convenience script (requires installing concurrently first):
```bash
npm install
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5173

## 🏗️ Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Web Speech API
- Recharts

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Google Gemini AI (3 Flash + TTS)

## 📊 Database

Six tables storing:
- User accounts with experience levels
- Assessment sessions with timestamps
- Question responses (all Q&A pairs)
- Scores per competency with feedback
- IDP plans with training recommendations
- Progress tracking for performance trends

View database: `npm run db:studio`

## 🔐 Security Features

✅ API key secured in backend (not exposed to browser)  
✅ JWT authentication for all API calls  
✅ Password hashing with bcrypt  
✅ CORS protection  
✅ Environment variable isolation  

## 📖 Documentation

- [Frontend README](frontend/README.md) - React app details
- [Backend README](backend/README.md) - API documentation
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete setup walkthrough

## 🚀 Deployment

**Frontend:** Can be deployed to Vercel, Netlify, or any static hosting  
**Backend:** Deploy to Heroku, Railway, Render, or any Node.js hosting  
**Database:** Use managed PostgreSQL (Supabase, Neon, Railway)

## 📝 License

MIT License - See LICENSE file for details

## 🎓 Created for MediHack 2026

AI-powered nursing competency assessment platform.

View original AI Studio app: https://ai.studio/apps/drive/1P-ndEi1IWfzBYaYjeUM7C3M3j8DJCqs4
