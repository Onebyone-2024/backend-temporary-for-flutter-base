# Backend Social Media API

A NestJS backend application with Prisma ORM and Supabase for building a social media platform.

## 📚 Documentation

- 📊 **[STATUS DASHBOARD](./STATUS.md)** - Live status of all systems ⭐ CHECK THIS FOR QUICK STATUS
- ✅ **[COMPLETE SUMMARY](./COMPLETE_SUMMARY.md)** - ✅ Full report of all fixes (6/6 issues resolved) ⭐ READ THIS FIRST
- ✅ **[SETUP COMPLETE VERIFIED](./SETUP_COMPLETE_VERIFIED.md)** - ✅ Production ready verification
- 🎯 **[Quick Reference](./QUICK_REFERENCE.md)** - Quick commands and endpoints cheat sheet
- 🚀 **[FINAL SETUP](./FINAL_SETUP.md)** - Complete step-by-step instructions
- 🚀 **[Quick Start Guide](./QUICK_START.md)** - Abbreviated setup guide
- 📊 **[Database Schema](./DATABASE_SCHEMA.md)** - Detailed schema documentation
- 🗺️ **[ER Diagram](./ER_DIAGRAM.md)** - Entity relationship visualization
- 🌐 **[API Examples](./API_EXAMPLES.md)** - API endpoints and usage examples
- 📁 **[Project Structure](./PROJECT_STRUCTURE.md)** - Directory organization
- ✅ **[Setup Complete](./SETUP_COMPLETE.md)** - Summary of what's done
- 🔧 **[Prisma Service Fix](./PRISMA_SERVICE_FIX.md)** - Architecture improvements
- 🔧 **[Prisma Service Summary](./PRISMA_SERVICE_FIX_SUMMARY.md)** - What was fixed
- 🔧 **[Prisma v5 Config](./PRISMA_V5_CONFIG.md)** - Prisma v5+ configuration
- 🔧 **[Prisma Fix Summary](./PRISMA_FIX_SUMMARY.md)** - Config what was fixed
- 🆘 **[Error Explanation](./ERROR_EXPLANATION.md)** - Understanding the errors
- 🆘 **[Quick Fix](./QUICK_FIX.md)** - 3-command solution
- 🆘 **[Node.js Fix](./FIX_NODE_VERSION.md)** - Fix Node.js version issues
- ✅ **[Checklist](./CHECKLIST.md)** - Verification checklist

## Features

- ✅ NestJS Framework
- ✅ Prisma ORM Integration
- ✅ Supabase PostgreSQL Database
- ✅ UUID Primary Keys
- ✅ User Management
- ✅ Direct Chat System
- ✅ Group Chat System
- ✅ Reels Feature
- ✅ Task List Management
- ✅ Validation with class-validator
- ✅ Environment Configuration
- ✅ CORS Enabled
- ✅ RESTful API Structure

## Installation

```bash
npm install
```

## Database Setup

1. Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

2. Update the Supabase connection string in `.env` file:

```env
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.conrftryifhxfopiiwtk.supabase.co:5432/postgres
```

3. Generate Prisma Client:

```bash
npx prisma generate
```

4. Run database migrations:

```bash
npx prisma migrate dev --name init
```

5. (Optional) Open Prisma Studio to view your data:

```bash
npx prisma studio
```

## Running the App

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## API Endpoints

### Health Check

- `GET /health` - Check application health

### Users

- `POST /users` - Create a new user
- `GET /users` - Get all users
- `GET /users/:id` - Get a user by ID
- `PATCH /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

## Project Structure

```
src/
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── users/
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── app.controller.ts
├── app.service.ts
├── app.module.ts
└── main.ts

prisma/
└── schema.prisma
```

## Database Schema

The Prisma schema includes the following models:

- **User**: User accounts with UUID, full name, email, status, password
- **DirectChat**: One-on-one chat rooms between two users
- **Group**: Group chat rooms with name and photo
- **Chat**: Chat messages (for both direct and group chats)
- **Reel**: Video reels with description and source
- **TaskList**: Task/todo lists with completion status

📖 See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for detailed schema documentation.

## Technology Stack

- **Framework**: NestJS 10
- **ORM**: Prisma 5.7
- **Database**: Supabase (PostgreSQL)
- **Validation**: class-validator, class-transformer
- **Language**: TypeScript

## Development

```bash
# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm run test

# Run e2e tests
npm run test:e2e
```

## License

UNLICENSED
