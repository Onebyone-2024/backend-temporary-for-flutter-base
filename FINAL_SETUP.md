# 🚀 FINAL SETUP INSTRUCTIONS

Ikuti langkah-langkah ini untuk menyelesaikan setup backend Anda.

---

## ⚠️ PREREQUISITE: Fix Node.js First!

Pastikan Anda menggunakan Node.js v20 atau lebih tinggi:

```bash
node --version
# Expected: v20.x.x or higher
```

**Jika Node.js < 20, upgrade sekarang:**

```bash
# Option 1: Homebrew
brew uninstall node@14
brew install node@20

# Option 2: NVM
nvm install 20
nvm use 20
```

**Verify:**

```bash
node --version   # v20.x.x
npm --version    # 10.x.x
```

---

## 🔧 STEP 1: Setup Environment Variables

### Create `.env` file

```bash
cp .env.example .env
```

### Edit `.env` with your Supabase credentials

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.conrftryifhxfopiiwtk.supabase.co:5432/postgres
PORT=3000
NODE_ENV=development
```

**⚠️ IMPORTANT:** Replace `YOUR_PASSWORD` with your actual Supabase password!

---

## 📦 STEP 2: Install Dependencies

```bash
npm install
```

**Expected output:**

```
added XXX packages, and audited XXX packages
```

---

## 🔨 STEP 3: Generate Prisma Client

```bash
npx prisma generate
```

**Expected output:**

```
✔ Generated Prisma Client (X.X.X) to ./node_modules/@prisma/client
```

---

## 🗄️ STEP 4: Run Database Migration

This creates all tables in your Supabase database:

```bash
npx prisma migrate dev --name init
```

**Expected output:**

```
✔ Applying migration `20231202xxxxx_init`
✔ Generated Prisma Client
Database synchronized successfully!
```

---

## ✅ STEP 5: Verify Database (Optional but Recommended)

Open Prisma Studio to view your database:

```bash
npx prisma studio
```

**Expected:**

- Opens at `http://localhost:5555`
- Shows all 6 tables:
  - users
  - direct_chats
  - groups
  - chats
  - reels
  - task_lists

---

## 🚀 STEP 6: Start the Application

```bash
npm run start:dev
```

**Expected output:**

```
[Nest] 12/2/2025, 10:30:00 AM [NestFactory] Starting Nest application...
[Nest] 12/2/2025, 10:30:00 AM [InstanceLoader] AppModule dependencies initialized
Application is running on: http://localhost:3000
```

---

## 🧪 STEP 7: Test the API

In a **new terminal**, test the health endpoint:

```bash
curl http://localhost:3000/health
```

**Expected response:**

```json
{
  "status": "ok",
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```

---

## ✨ STEP 8: Test Creating a User (Optional)

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "status": "online"
  }'
```

**Expected response:**

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "fullName": "John Doe",
  "email": "john@example.com",
  "status": "online",
  "createdAt": "2025-12-02T10:30:00.000Z"
}
```

---

## 🎉 SUCCESS!

Jika semua langkah berhasil, backend Anda siap! 🚀

---

## 📚 Next: Read Documentation

1. **Schema Details**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
2. **API Endpoints**: [API_EXAMPLES.md](./API_EXAMPLES.md)
3. **Prisma Config**: [PRISMA_V5_CONFIG.md](./PRISMA_V5_CONFIG.md)
4. **Project Structure**: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

---

## ❌ Troubleshooting

### Error: "Cannot find module '@prisma/client'"

```bash
npm install
npx prisma generate
```

### Error: "Database connection failed"

- Check `.env` DATABASE_URL is correct
- Verify no brackets [] around password
- Check Supabase database is active
- Test connection from Supabase dashboard

### Error: "Migration failed"

```bash
# Reset and try again
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Error: "Port 3000 already in use"

```bash
# Change port in .env
PORT=3001

# Or kill process
lsof -ti:3000 | xargs kill -9
```

### Error: "Prisma validation failed"

```bash
npx prisma validate
npx prisma generate
```

---

## 🆘 Still Having Issues?

Check these files:

- [FIX_NODE_VERSION.md](./FIX_NODE_VERSION.md) - Node.js issues
- [PRISMA_V5_CONFIG.md](./PRISMA_V5_CONFIG.md) - Prisma config issues
- [QUICK_START.md](./QUICK_START.md) - General setup guide
- [CHECKLIST.md](./CHECKLIST.md) - Verification checklist

---

## 🎯 Commands Reference

```bash
# Development
npm run start:dev          # Start with hot-reload
npm run start              # Start normally

# Database
npx prisma studio         # Open database GUI
npx prisma generate       # Generate Prisma Client
npx prisma migrate dev    # Create/run migrations
npx prisma migrate reset  # Reset database (⚠️ deletes data)
npx prisma validate       # Validate schema

# Code Quality
npm run format             # Format code
npm run lint               # Run linter
npm run test               # Run tests

# Build
npm run build              # Build for production
npm run start:prod         # Run production build
```

---

## 📊 Project Overview

```
backend-social-media/
├── Database: Supabase PostgreSQL
├── ORM: Prisma v5+
├── Framework: NestJS 10
├── Language: TypeScript
└── Features:
    ├── Users
    ├── Direct Chat
    ├── Group Chat
    ├── Reels
    └── Task Lists
```

---

## 🎓 Learning Path

1. ✅ Setup complete
2. 📖 Read [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
3. 🌐 Explore [API_EXAMPLES.md](./API_EXAMPLES.md)
4. 🏗️ Generate CRUD modules for resources
5. 🔐 Add authentication (JWT)
6. 💬 Add WebSocket for real-time chat
7. 📁 Add file upload feature

---

**Congratulations! Your backend is ready for development!** 🎊

Questions? Check the documentation files or review [CHECKLIST.md](./CHECKLIST.md).
