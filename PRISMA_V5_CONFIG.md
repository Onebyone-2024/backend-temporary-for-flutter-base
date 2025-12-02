# 🔧 Prisma v5 Configuration Fix

## Problem

Prisma v5+ tidak lagi mendukung property `url` langsung di schema file. Error:

```
The datasource property `url` is no longer supported in schema files.
```

## Solution

Kami telah mengimplementasikan konfigurasi yang benar untuk Prisma v5+:

---

## 📝 Changes Made

### 1. Updated `prisma/schema.prisma`

**Removed:**

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // ❌ No longer supported
}
```

**Updated to:**

```prisma
datasource db {
  provider = "postgresql"
}
```

The `url` is now managed via **environment variables** and **prisma.config.ts**.

### 2. Created `prisma.config.ts`

New configuration file for database connection:

```javascript
module.exports = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};
```

This file tells Prisma where to find the database URL from environment variables.

### 3. Updated `src/prisma/prisma.service.ts`

Simplified the service to work with Prisma v5+:

```typescript
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

---

## ✅ What You Need to Do

### 1. Ensure `.env` is Configured

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.conrftryifhxfopiiwtk.supabase.co:5432/postgres
PORT=3000
NODE_ENV=development
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Run Migration

```bash
npx prisma migrate dev --name init
```

---

## 🔍 How It Works

**Flow of database connection:**

```
.env (DATABASE_URL)
  ↓
prisma.config.ts (reads from .env)
  ↓
prisma/schema.prisma (uses config)
  ↓
@prisma/client (generated client)
  ↓
PrismaService (NestJS service)
  ↓
Your application
```

---

## 📚 References

- **Prisma Config**: https://pris.ly/d/config-datasource
- **PrismaClient Constructor**: https://pris.ly/d/prisma7-client-config
- **Prisma Migration**: https://www.prisma.io/docs/orm/prisma-migrate/getting-started

---

## ✨ Benefits of This Approach

✅ **More secure** - Database URL not in schema file
✅ **Better organization** - Configuration separated from schema
✅ **Compatibility** - Works with Prisma v5+
✅ **Flexibility** - Easy to switch between environments
✅ **Type-safe** - Config file can be validated

---

## 🚀 Next Steps

1. Make sure `.env` has correct `DATABASE_URL`
2. Run `npx prisma generate`
3. Run `npx prisma migrate dev --name init`
4. Start your application: `npm run start:dev`

If you encounter any issues, check that:

- `.env` file exists and is properly formatted
- `DATABASE_URL` has correct connection string
- `prisma.config.ts` exists in project root
- Dependencies are installed: `npm install`
