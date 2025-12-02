# Database Schema Documentation

## Overview

Database schema untuk aplikasi social media dengan fitur chat, groups, reels, dan task list.

## Tables

### 1. **users**

User accounts dengan informasi dasar.

| Field     | Type     | Description            |
| --------- | -------- | ---------------------- |
| uuid      | UUID     | Primary key            |
| fullName  | String   | Nama lengkap user      |
| email     | String   | Email (unique)         |
| status    | String   | Status user (optional) |
| password  | String   | Password (hashed)      |
| createdAt | DateTime | Timestamp pembuatan    |

**Relations:**

- Has many DirectChats (as user1 and user2)
- Has many Chats
- Has many Reels
- Has many TaskLists

---

### 2. **direct_chats**

Direct message room antara 2 users.

| Field     | Type     | Description         |
| --------- | -------- | ------------------- |
| uuid      | UUID     | Primary key         |
| uuid1     | UUID     | User 1 UUID (FK)    |
| uuid2     | UUID     | User 2 UUID (FK)    |
| createdAt | DateTime | Timestamp pembuatan |

**Constraints:**

- Unique combination of uuid1 and uuid2
- Cascade delete when user deleted

---

### 3. **groups**

Group chat rooms.

| Field     | Type     | Description               |
| --------- | -------- | ------------------------- |
| uuid      | UUID     | Primary key               |
| name      | String   | Nama group                |
| photo     | String   | URL foto group (optional) |
| createdAt | DateTime | Timestamp pembuatan       |

**Relations:**

- Has many Chats

---

### 4. **chats**

Chat messages (bisa untuk direct chat atau group).

| Field       | Type     | Description               |
| ----------- | -------- | ------------------------- |
| uuid        | UUID     | Primary key               |
| textMessage | Text     | Isi pesan                 |
| createdAt   | DateTime | Timestamp pembuatan       |
| createdBy   | UUID     | User creator UUID (FK)    |
| groupUuid   | UUID     | Group UUID (FK, optional) |

**Relations:**

- Belongs to User (creator)
- Belongs to Group (optional)
- Cascade delete when user/group deleted

---

### 5. **reels**

Video reels posted by users.

| Field       | Type     | Description               |
| ----------- | -------- | ------------------------- |
| uuid        | UUID     | Primary key               |
| description | Text     | Deskripsi reel (optional) |
| source      | String   | URL video source          |
| createdAt   | DateTime | Timestamp pembuatan       |
| createdBy   | UUID     | User creator UUID (FK)    |

**Relations:**

- Belongs to User (creator)
- Cascade delete when user deleted

---

### 6. **task_lists**

Task/todo lists created by users.

| Field       | Type     | Description                  |
| ----------- | -------- | ---------------------------- |
| uuid        | UUID     | Primary key                  |
| task        | Text     | Isi task                     |
| isCompleted | Boolean  | Status task (default: false) |
| createdAt   | DateTime | Timestamp pembuatan          |
| createdBy   | UUID     | User creator UUID (FK)       |

**Relations:**

- Belongs to User (creator)
- Cascade delete when user deleted

---

## Key Features

✅ **UUID Primary Keys** - Semua tabel menggunakan UUID sebagai primary key
✅ **Timestamps** - Semua tabel memiliki `createdAt`
✅ **Relations** - Foreign key relationships dengan cascade delete
✅ **Snake Case** - Database column names menggunakan snake_case
✅ **Type Safety** - Menggunakan `@db.Uuid` dan `@db.Text` untuk tipe data spesifik

## Migration Commands

Setelah Node.js diperbaiki, jalankan:

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

## Example Queries

### Create User

```typescript
const user = await prisma.user.create({
  data: {
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    status: 'online',
  },
});
```

### Create Direct Chat

```typescript
const directChat = await prisma.directChat.create({
  data: {
    uuid1: user1.uuid,
    uuid2: user2.uuid,
  },
});
```

### Create Chat Message

```typescript
const chat = await prisma.chat.create({
  data: {
    textMessage: 'Hello!',
    createdBy: user.uuid,
    groupUuid: group.uuid, // optional
  },
});
```

### Create Reel

```typescript
const reel = await prisma.reel.create({
  data: {
    description: 'My first reel',
    source: 'https://example.com/video.mp4',
    createdBy: user.uuid,
  },
});
```

### Create Task

```typescript
const task = await prisma.taskList.create({
  data: {
    task: 'Complete project',
    createdBy: user.uuid,
  },
});
```

### Update Task Status

```typescript
const updatedTask = await prisma.taskList.update({
  where: { uuid: taskUuid },
  data: { isCompleted: true },
});
```

## Next Steps

1. **Fix Node.js** - Upgrade ke Node.js v20
2. **Install Dependencies** - `npm install`
3. **Setup .env** - Tambahkan DATABASE_URL Supabase
4. **Generate Client** - `npx prisma generate`
5. **Run Migration** - `npx prisma migrate dev --name init`
6. **Start App** - `npm run start:dev`
