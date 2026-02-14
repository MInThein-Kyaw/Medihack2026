# Medihack Project Structure

## 📂 Clean Separation: Frontend & Backend

```
medihack/
│
├── 📁 frontend/                 ⚛️  React Application
│   ├── components/              UI Components
│   │   ├── Assessment.tsx
│   │   ├── Avatar.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   └── Report.tsx
│   │
│   ├── services/                API Integration
│   │   └── apiService.ts        Backend communication
│   │
│   ├── App.tsx                  Main React component
│   ├── index.tsx                Entry point
│   ├── types.ts                 TypeScript interfaces
│   ├── constants.ts             App constants
│   ├── package.json             Frontend dependencies
│   ├── vite.config.ts           Build configuration
│   └── tsconfig.json            TypeScript config
│
├── 📁 backend/                  🚀 Node.js API Server
│   ├── src/
│   │   ├── routes/              API Endpoints
│   │   │   ├── auth.ts          Authentication
│   │   │   ├── assessment.ts    Assessments
│   │   │   └── user.ts          User management
│   │   │
│   │   ├── middleware/          Request handling
│   │   │   └── auth.ts          JWT verification
│   │   │
│   │   └── server.ts            Express server
│   │
│   ├── prisma/                  Database
│   │   └── schema.prisma        DB schema
│   │
│   ├── package.json             Backend dependencies
│   ├── tsconfig.json            TypeScript config
│   └── .env                     Environment variables
│
├── 📄 package.json              Root convenience scripts
├── 📄 README.md                 Project overview
├── 📄 SETUP_GUIDE.md            Complete setup guide
└── 📄 .gitignore                Ignore rules

```

## 🎯 Why This Structure?

### ✅ Clear Separation of Concerns
- **Frontend** = User interface (React)
- **Backend** = Business logic + Database (Node.js)
- Each has its own `package.json` and dependencies

### ✅ Independent Development
- Frontend team can work without backend running (mock data)
- Backend team can test APIs directly (Postman/curl)
- Different deployment strategies possible

### ✅ Easy to Understand
- New developers immediately see the architecture
- "Where is the login page?" → `frontend/components/Login.tsx`
- "Where is the auth API?" → `backend/src/routes/auth.ts`

### ✅ Scalable
- Can add microservices alongside backend
- Frontend can be split into micro-frontends
- Easy to add mobile app using same backend

## 🔄 How They Communicate

```
┌─────────────────┐         HTTP/REST          ┌─────────────────┐
│                 │  ───────────────────────>  │                 │
│   FRONTEND      │    http://localhost:3001   │    BACKEND      │
│  (port 5173)    │  <───────────────────────  │   (port 3001)   │
│                 │         JSON Data          │                 │
└─────────────────┘                            └─────────────────┘
        │                                               │
        │ User Interface                                │ Database
        │ Voice Input                                   │ AI Integration
        │ Charts/Reports                                │ Authentication
        
```

## 🚀 Commands Reference

### From Root Directory
```bash
npm run install:all    # Install all dependencies
npm run dev            # Start both frontend & backend
npm run db:studio      # Open database viewer
npm run db:push        # Update database schema
```

### Frontend Only
```bash
cd frontend
npm run dev            # Start Vite dev server
npm run build          # Build for production
```

### Backend Only
```bash
cd backend
npm run dev            # Start Express server
npm run build          # Compile TypeScript
```

## 📝 Configuration Files

### Frontend `.env` (optional)
Not needed! Backend URL is hardcoded in `apiService.ts`

### Backend `.env` (required)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="random-secret-key"
GEMINI_API_KEY="your-api-key"
PORT=3001
```

## 🎓 Learning Path

1. **Frontend First?**
   - Start in `frontend/components/Login.tsx`
   - Follow component tree: Login → Assessment → Dashboard → Report
   - See how `apiService.ts` calls backend

2. **Backend First?**
   - Start in `backend/src/server.ts`
   - Trace routes: auth → assessment → user
   - Check `prisma/schema.prisma` for database structure

3. **Full Stack?**
   - Login flow: `Login.tsx` → `auth.ts` → PostgreSQL
   - Assessment: `Assessment.tsx` → `assessment.ts` → Gemini AI → PostgreSQL
   - Data retrieval: `Dashboard.tsx` → `user.ts` → PostgreSQL

Enjoy coding! 🎉
