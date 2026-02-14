# 🚀 Quick Start - Medihack

Copy-paste these commands to get started quickly!

## ⚡ Super Fast Setup (5 minutes)

```bash
# 1. Install everything
npm run install:all

# 2. Configure backend/.env
# Edit backend/.env with your database URL and API key

# 3. Setup database
cd backend
npm run db:push
cd ..

# 4. Start everything
npm install  # Installs concurrently
npm run dev
```

Done! ✅
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Database UI: http://localhost:5555 (run `npm run db:studio`)

---

## 📋 Manual Setup (Step by Step)

### 1️⃣ Install Frontend
```bash
cd frontend
npm install
```

### 2️⃣ Install Backend
```bash
cd ../backend
npm install
```

### 3️⃣ Configure Backend
Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/medihack"
JWT_SECRET="your-random-secret-key-here"
GEMINI_API_KEY="your-gemini-api-key"
PORT=3001
```

### 4️⃣ Create Database
```bash
# In psql:
CREATE DATABASE medihack;
```

### 5️⃣ Initialize Database
```bash
# From backend directory:
npm run db:push
```

### 6️⃣ Start Backend
```bash
# Terminal 1 - from backend/:
npm run dev
```

### 7️⃣ Start Frontend
```bash
# Terminal 2 - from frontend/:
npm run dev
```

---

## 🎯 Common Commands

```bash
# From root directory:
npm run dev              # Start both frontend & backend
npm run db:studio        # Open database viewer
npm run db:push          # Update database schema

# From frontend/:
npm run dev              # Start Vite (port 5173)
npm run build            # Build for production

# From backend/:
npm run dev              # Start Express (port 3001)
npm run build            # Compile TypeScript
npm run db:studio        # View database
npm run db:push          # Create/update tables
```

---

## ✅ Verify It Works

1. **Backend:** http://localhost:3001/api/health
   ```json
   {"status":"ok","message":"Medihack Backend API is running"}
   ```

2. **Frontend:** http://localhost:5173
   - Should show login page
   - Can toggle TH/EN languages

3. **Test Login:**
   - Username: `test_nurse`
   - Experience: `3` years
   - Start assessment

---

## 🐛 Quick Fixes

**Port already in use?**
```bash
# Change PORT in backend/.env to 3002 or 3003
```

**Database connection error?**
```bash
# Check if PostgreSQL is running:
psql -U postgres
```

**Frontend can't reach backend?**
```bash
# Verify backend is running on port 3001
# Check frontend/services/apiService.ts API_URL
```

**Module not found?**
```bash
# Reinstall dependencies:
cd frontend && npm install
cd ../backend && npm install
```

---

## 📚 More Help

- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete detailed setup
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Architecture overview
- [frontend/README.md](frontend/README.md) - Frontend docs
- [backend/README.md](backend/README.md) - API docs

---

## 🎓 First Time Using This?

1. Read [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) to understand the architecture
2. Follow [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions
3. Check individual component READMEs for specific documentation

**Happy Coding!** 🚀
