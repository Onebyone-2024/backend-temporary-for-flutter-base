# 📁 Project Structure

```
backend-social-media/
│
├── 📄 Configuration Files
│   ├── package.json              # Dependencies & scripts
│   ├── tsconfig.json             # TypeScript config
│   ├── nest-cli.json             # NestJS CLI config
│   ├── .eslintrc.js              # ESLint rules
│   ├── .prettierrc               # Prettier config
│   ├── .gitignore                # Git ignore rules
│   ├── .nvmrc                    # Node version (v20)
│   ├── .env.example              # Environment template
│   └── .env                      # Environment variables (not in git)
│
├── 📚 Documentation
│   ├── README.md                 # Main documentation
│   ├── QUICK_START.md            # Setup guide
│   ├── SETUP_COMPLETE.md         # Summary of what's done
│   ├── DATABASE_SCHEMA.md        # Schema documentation
│   ├── ER_DIAGRAM.md             # Entity relationships
│   ├── FIX_NODE_VERSION.md       # Node.js troubleshooting
│   └── schema.sql                # Raw SQL schema
│
├── 🗄️ Database (Prisma)
│   └── prisma/
│       ├── schema.prisma         # Database schema
│       └── migrations/           # Migration files (after init)
│           └── .gitkeep
│
├── 💻 Source Code
│   └── src/
│       ├── main.ts               # Application entry point
│       ├── app.module.ts         # Root module
│       ├── app.controller.ts     # App controller
│       ├── app.service.ts        # App service
│       │
│       ├── prisma/               # Prisma module
│       │   ├── prisma.service.ts
│       │   └── prisma.module.ts
│       │
│       └── users/                # Users module (example)
│           ├── users.module.ts
│           ├── users.controller.ts
│           ├── users.service.ts
│           └── dto/
│               ├── create-user.dto.ts
│               └── update-user.dto.ts
│
└── 📦 Dependencies
    └── node_modules/             # NPM packages

```

## 🎯 Key Directories

### `/prisma`

- **schema.prisma**: Database schema definition
- **migrations/**: Database migration history

### `/src`

- **main.ts**: Bootstrap application
- **app.module.ts**: Root module with Prisma integration
- **prisma/**: Global Prisma service
- **users/**: Example CRUD module

### `/docs` (Documentation)

- All `.md` files for documentation
- Schema diagrams and guides

## 📊 Database Tables (From Prisma Schema)

```
Database: Supabase PostgreSQL
├── users          (User accounts)
├── direct_chats   (Direct messaging)
├── groups         (Group rooms)
├── chats          (Messages)
├── reels          (Video reels)
└── task_lists     (Todo tasks)
```

## 🔧 Generated After Setup

After running `npx prisma migrate dev`:

```
prisma/
└── migrations/
    └── 20231202xxxxx_init/
        └── migration.sql
```

After running `npx prisma generate`:

```
node_modules/
└── @prisma/
    └── client/
        └── index.d.ts  (Generated types)
```

After building:

```
dist/
├── main.js
├── app.module.js
└── ... (compiled TypeScript)
```

## 📝 Notes

- ✅ All tables use **UUID** as primary key
- ✅ All tables have **created_at** timestamp
- ✅ Proper **foreign key** relationships
- ✅ **Cascade delete** for data integrity
- ✅ **Snake_case** for database columns
- ✅ **camelCase** for TypeScript/JavaScript

## 🚀 Ready to Code!

The project structure is complete and ready for development.
