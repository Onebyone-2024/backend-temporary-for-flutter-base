# ✅ Setup Checklist

Gunakan checklist ini untuk memastikan semua setup sudah benar.

---

## 📋 Pre-Setup Requirements

- [ ] Node.js versi 20 atau lebih tinggi terinstall

  ```bash
  node --version  # Should show v20.x.x
  ```

- [ ] NPM terinstall

  ```bash
  npm --version   # Should show 10.x.x
  ```

- [ ] Akun Supabase sudah dibuat
  - [ ] Database sudah dibuat di Supabase
  - [ ] Connection string sudah didapat

---

## 🔧 Setup Steps

### 1. Install Dependencies

- [ ] Dependencies berhasil terinstall
  ```bash
  npm install
  ```
  ✅ Success: `node_modules` folder exists

### 2. Environment Configuration

- [ ] File `.env` sudah dibuat dari `.env.example`
  ```bash
  cp .env.example .env
  ```
- [ ] DATABASE_URL sudah diisi dengan connection string Supabase
  ```env
  DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
  ```
  ⚠️ Pastikan `YOUR_PASSWORD` diganti dengan password asli!

### 3. Prisma Client

- [ ] Prisma Client berhasil di-generate
  ```bash
  npx prisma generate
  ```
  ✅ Success: Message "✔ Generated Prisma Client"

### 4. Database Migration

- [ ] Migration berhasil dijalankan

  ```bash
  npx prisma migrate dev --name init
  ```

  ✅ Success: Tables created in Supabase

- [ ] Check tables di Supabase Dashboard
  - [ ] `users` table exists
  - [ ] `direct_chats` table exists
  - [ ] `groups` table exists
  - [ ] `chats` table exists
  - [ ] `reels` table exists
  - [ ] `task_lists` table exists
  - [ ] `_prisma_migrations` table exists

### 5. Start Application

- [ ] Application berhasil start
  ```bash
  npm run start:dev
  ```
  ✅ Success: "Application is running on: http://localhost:3000"

---

## 🧪 Testing

### Health Check

- [ ] Health endpoint berfungsi
  ```bash
  curl http://localhost:3000/health
  ```
  ✅ Expected: `{"status":"ok","timestamp":"..."}`

### Users API

- [ ] Create user endpoint berfungsi

  ```bash
  curl -X POST http://localhost:3000/users \
    -H "Content-Type: application/json" \
    -d '{"fullName":"Test","email":"test@test.com","password":"test123"}'
  ```

  ✅ Expected: Returns user object with UUID

- [ ] Get users endpoint berfungsi
  ```bash
  curl http://localhost:3000/users
  ```
  ✅ Expected: Returns array of users

### Prisma Studio

- [ ] Prisma Studio dapat dibuka
  ```bash
  npx prisma studio
  ```
  ✅ Success: Opens at http://localhost:5555
- [ ] Dapat melihat data di Prisma Studio
  - [ ] Users table visible
  - [ ] Can add/edit/delete records
  - [ ] Relations working properly

---

## 📁 Files Verification

### Configuration Files

- [ ] `package.json` - Contains Prisma dependencies
- [ ] `tsconfig.json` - TypeScript config exists
- [ ] `nest-cli.json` - NestJS config exists
- [ ] `.env` - Environment variables configured
- [ ] `.nvmrc` - Node version 20

### Prisma Files

- [ ] `prisma/schema.prisma` - Schema defined with 6 models
- [ ] `prisma/migrations/` - Migration folder exists

### Source Code

- [ ] `src/main.ts` - Entry point exists
- [ ] `src/app.module.ts` - Uses PrismaModule
- [ ] `src/prisma/prisma.service.ts` - Prisma service exists
- [ ] `src/prisma/prisma.module.ts` - Prisma module exists
- [ ] `src/users/` - Users module exists

### Documentation

- [ ] `README.md` - Main documentation
- [ ] `QUICK_START.md` - Setup guide
- [ ] `DATABASE_SCHEMA.md` - Schema docs
- [ ] `ER_DIAGRAM.md` - Relationships
- [ ] `API_EXAMPLES.md` - API examples
- [ ] `PROJECT_STRUCTURE.md` - Directory structure
- [ ] `SETUP_COMPLETE.md` - Summary

---

## 🚨 Common Issues

### Issue: Cannot find module '@prisma/client'

**Solution:**

```bash
npx prisma generate
npm install
```

### Issue: Database connection failed

**Solution:**

- Check `.env` DATABASE_URL is correct
- Verify Supabase database is active
- Check password has no brackets []
- Test connection from Supabase dashboard

### Issue: Migration failed

**Solution:**

```bash
# Reset and try again
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Issue: Port 3000 already in use

**Solution:**

```bash
# Change port in .env
PORT=3001

# Or kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Issue: Node.js version error

**Solution:**

```bash
# Install Node 20
brew install node@20
# or
nvm install 20
nvm use 20
```

---

## ✅ All Checks Passed?

Jika semua checklist sudah ✅, maka setup Anda **BERHASIL!** 🎉

### Next Steps:

1. Read [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) untuk memahami struktur database
2. Read [API_EXAMPLES.md](./API_EXAMPLES.md) untuk contoh penggunaan API
3. Mulai develop fitur-fitur baru:
   - Generate modules untuk chats, groups, reels, tasks
   - Implement authentication dengan JWT
   - Add WebSocket untuk real-time chat
   - Add file upload untuk reels dan photos

---

## 📊 Final Verification

Run all verification commands:

```bash
# 1. Check Node version
node --version

# 2. Check dependencies
npm list @prisma/client @nestjs/core

# 3. Verify Prisma Client
npx prisma validate

# 4. Check database connection
npx prisma db pull

# 5. Start application
npm run start:dev

# 6. Test health endpoint (in another terminal)
curl http://localhost:3000/health
```

If all commands succeed, you're ready! 🚀

---

## 🎯 Success Criteria

✅ Node.js v20+ installed
✅ All npm dependencies installed
✅ .env configured with Supabase
✅ Prisma Client generated
✅ Database migrated (6 tables + 1 migration table)
✅ Application running on port 3000
✅ Health endpoint responding
✅ Prisma Studio accessible

**Congratulations! Your backend is ready for development!** 🎊
