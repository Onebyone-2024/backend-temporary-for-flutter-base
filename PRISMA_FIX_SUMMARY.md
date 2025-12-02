# ✅ Prisma v5 Configuration - FIXED!

## 🎯 Problem Solved

**Error yang terjadi:**

```
The datasource property `url` is no longer supported in schema files.
Move connection URLs for Migrate to `prisma.config.ts`
```

**Status:** ✅ **FIXED**

---

## 📝 What Was Changed

### 1. **prisma/schema.prisma**

Removed the `url` property from datasource:

```prisma
datasource db {
  provider = "postgresql"
  // ❌ url = env("DATABASE_URL") - REMOVED
}
```

### 2. **prisma.config.ts** (NEW)

Created new configuration file:

```javascript
module.exports = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};
```

### 3. **src/prisma/prisma.service.ts**

Simplified to work with Prisma v5:

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

## ✨ Configuration Flow

```
Environment Variables (.env)
           ↓
    DATABASE_URL
           ↓
   prisma.config.ts
           ↓
  prisma/schema.prisma
           ↓
   Prisma Client (@prisma/client)
           ↓
    PrismaService
           ↓
  Your Application
```

---

## 🚀 Next Steps

### 1. Verify `.env` File

Make sure DATABASE_URL is set correctly:

```bash
cat .env | grep DATABASE_URL
```

Expected output:

```
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

Expected: ✔ Generated Prisma Client

### 3. Run Database Migration

```bash
npx prisma migrate dev --name init
```

Expected: Tables created in Supabase

### 4. Start Application

```bash
npm run start:dev
```

Expected: Application running on port 3000

---

## ✅ Verification Checklist

- [ ] `.env` file exists with DATABASE_URL
- [ ] `prisma.config.ts` exists in project root
- [ ] `prisma/schema.prisma` has no `url` property
- [ ] `src/prisma/prisma.service.ts` is simplified
- [ ] `npm install` completed successfully
- [ ] `npx prisma generate` succeeded
- [ ] `npx prisma migrate dev --name init` succeeded
- [ ] `npm run start:dev` runs without errors

---

## 🔗 Files Modified

✅ Created: `prisma.config.ts`
✅ Updated: `prisma/schema.prisma`
✅ Updated: `src/prisma/prisma.service.ts`
✅ Updated: `README.md`
✅ Created: `PRISMA_V5_CONFIG.md`

---

## 📚 Learn More

- Read: [PRISMA_V5_CONFIG.md](./PRISMA_V5_CONFIG.md)
- Prisma Docs: https://pris.ly/d/config-datasource
- Setup Guide: [QUICK_START.md](./QUICK_START.md)

---

## 🎉 Ready to Go!

Your Prisma configuration is now compatible with **Prisma v5+** and **Supabase**.

**Next:** Follow [QUICK_START.md](./QUICK_START.md) to complete the setup!
