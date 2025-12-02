# Quick Start Guide

## 📋 Prerequisites Check

Sebelum memulai, pastikan Anda sudah memperbaiki Node.js version issue.

### Check Node.js Version

```bash
node --version   # Should be v20.x.x or higher
npm --version    # Should be 10.x.x or higher
```

### If Node.js < 20, Fix It First!

```bash
# Option 1: Using Homebrew (Recommended)
brew uninstall node@14
brew install node@20
brew link node@20 --force

# Option 2: Using NVM
nvm install 20
nvm use 20
```

---

## 🚀 Setup Steps

### 1. Install Dependencies

```bash
cd /Users/onebyone/backend-social-media
npm install
```

### 2. Configure Database

**A. Copy environment file:**

```bash
cp .env.example .env
```

**B. Edit `.env` file:**

```env
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.conrftryifhxfopiiwtk.supabase.co:5432/postgres
PORT=3000
NODE_ENV=development
```

**⚠️ Important:** Ganti `[YOUR_PASSWORD]` dengan password Supabase Anda!

### 3. Generate Prisma Client

```bash
npx prisma generate
```

**Expected Output:**

```
✔ Generated Prisma Client
```

### 4. Run Database Migration

```bash
npx prisma migrate dev --name init
```

**This will:**

- Create all tables in Supabase
- Apply schema changes
- Generate migration files

**Expected Output:**

```
✔ Applying migration `20231202_init`
✔ Generated Prisma Client
Database synchronized successfully!
```

### 5. Verify Database (Optional)

```bash
npx prisma studio
```

This opens a web UI at `http://localhost:5555` to view/edit your database.

### 6. Start Development Server

```bash
npm run start:dev
```

**Expected Output:**

```
[Nest] Starting Nest application...
[Nest] Application is running on: http://localhost:3000
```

---

## 🧪 Test the API

### Health Check

```bash
curl http://localhost:3000/health
```

**Expected Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-12-02T..."
}
```

### Create a User (Example)

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

---

## 📊 Database Tables Created

After migration, you should have these tables in Supabase:

- ✅ `users` - User accounts
- ✅ `direct_chats` - Direct message rooms
- ✅ `groups` - Group chat rooms
- ✅ `chats` - Chat messages
- ✅ `reels` - Video reels
- ✅ `task_lists` - Task/todo lists
- ✅ `_prisma_migrations` - Prisma migration history

---

## 🛠️ Common Commands

```bash
# Development
npm run start:dev          # Start with hot-reload
npm run start              # Start normally
npm run start:prod         # Production mode

# Database
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create new migration
npx prisma migrate reset   # Reset database (⚠️ deletes all data)
npx prisma generate        # Regenerate Prisma Client
npx prisma db push         # Push schema without migration

# Code Quality
npm run format             # Format code with Prettier
npm run lint               # Run ESLint
npm run test               # Run tests
```

---

## 📚 Next Steps

1. ✅ **Read Schema Documentation**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
2. ✅ **View ER Diagram**: [ER_DIAGRAM.md](./ER_DIAGRAM.md)
3. ✅ **Create CRUD Modules**: Generate modules for chats, groups, reels, tasks
4. ✅ **Add Authentication**: Implement JWT authentication
5. ✅ **Add Validation**: Use class-validator for DTOs
6. ✅ **Add WebSocket**: For real-time chat functionality

---

## ❓ Troubleshooting

### Error: "Cannot find module '@prisma/client'"

```bash
npx prisma generate
npm install
```

### Error: "Database connection failed"

- Check `.env` file has correct DATABASE_URL
- Verify Supabase database is running
- Check password is correct (no brackets)

### Error: Migration failed

```bash
# Reset and try again
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Port 3000 already in use

```bash
# Change PORT in .env
PORT=3001

# Or kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

## 🎉 Success!

Your backend is ready! Access:

- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Prisma Studio**: http://localhost:5555 (when running `npx prisma studio`)
