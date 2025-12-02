# 🌐 API Examples

Collection of example API requests for testing your backend.

---

## 🏥 Health Check

### GET /health

Check if the API is running.

```bash
curl http://localhost:3000/health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```

---

## 👤 Users API

### POST /users - Create User

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "status": "online"
  }'
```

**Response:**

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "fullName": "John Doe",
  "email": "john@example.com",
  "status": "online",
  "createdAt": "2025-12-02T10:30:00.000Z"
}
```

### GET /users - Get All Users

```bash
curl http://localhost:3000/users
```

### GET /users/:uuid - Get One User

```bash
curl http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000
```

### PATCH /users/:uuid - Update User

```bash
curl -X PATCH http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Updated",
    "status": "away"
  }'
```

### DELETE /users/:uuid - Delete User

```bash
curl -X DELETE http://localhost:3000/users/550e8400-e29b-41d4-a716-446655440000
```

---

## 💬 Chats API (To Be Implemented)

### POST /chats - Create Chat Message

```bash
curl -X POST http://localhost:3000/chats \
  -H "Content-Type: application/json" \
  -d '{
    "textMessage": "Hello, how are you?",
    "createdBy": "550e8400-e29b-41d4-a716-446655440000",
    "groupUuid": "660e8400-e29b-41d4-a716-446655440000"
  }'
```

### GET /chats - Get All Chats

```bash
curl http://localhost:3000/chats
```

### GET /chats/:uuid - Get One Chat

```bash
curl http://localhost:3000/chats/770e8400-e29b-41d4-a716-446655440000
```

---

## 💬 Direct Chats API (To Be Implemented)

### POST /direct-chats - Create Direct Chat Room

```bash
curl -X POST http://localhost:3000/direct-chats \
  -H "Content-Type: application/json" \
  -d '{
    "uuid1": "550e8400-e29b-41d4-a716-446655440000",
    "uuid2": "660e8400-e29b-41d4-a716-446655440000"
  }'
```

### GET /direct-chats - Get User's Direct Chats

```bash
curl http://localhost:3000/direct-chats?userUuid=550e8400-e29b-41d4-a716-446655440000
```

---

## 👥 Groups API (To Be Implemented)

### POST /groups - Create Group

```bash
curl -X POST http://localhost:3000/groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Family Group",
    "photo": "https://example.com/group-photo.jpg"
  }'
```

### GET /groups - Get All Groups

```bash
curl http://localhost:3000/groups
```

### PATCH /groups/:uuid - Update Group

```bash
curl -X PATCH http://localhost:3000/groups/880e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Family Group"
  }'
```

---

## 🎥 Reels API (To Be Implemented)

### POST /reels - Create Reel

```bash
curl -X POST http://localhost:3000/reels \
  -H "Content-Type: application/json" \
  -d '{
    "description": "My awesome video",
    "source": "https://example.com/video.mp4",
    "createdBy": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### GET /reels - Get All Reels

```bash
curl http://localhost:3000/reels
```

### GET /reels/:uuid - Get One Reel

```bash
curl http://localhost:3000/reels/990e8400-e29b-41d4-a716-446655440000
```

### DELETE /reels/:uuid - Delete Reel

```bash
curl -X DELETE http://localhost:3000/reels/990e8400-e29b-41d4-a716-446655440000
```

---

## ✅ Tasks API (To Be Implemented)

### POST /tasks - Create Task

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Complete the project documentation",
    "createdBy": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

### GET /tasks - Get All Tasks

```bash
curl http://localhost:3000/tasks?userUuid=550e8400-e29b-41d4-a716-446655440000
```

### PATCH /tasks/:uuid - Toggle Task Completion

```bash
curl -X PATCH http://localhost:3000/tasks/aa0e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "isCompleted": true
  }'
```

### DELETE /tasks/:uuid - Delete Task

```bash
curl -X DELETE http://localhost:3000/tasks/aa0e8400-e29b-41d4-a716-446655440000
```

---

## 🧪 Using Prisma Directly

### Open Prisma Studio

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can:

- View all tables
- Add/edit/delete records
- Run queries visually

---

## 📝 Testing with Postman/Insomnia

Import this collection:

```json
{
  "name": "Social Media Backend",
  "baseUrl": "http://localhost:3000",
  "endpoints": [
    {
      "name": "Health Check",
      "method": "GET",
      "url": "{{baseUrl}}/health"
    },
    {
      "name": "Create User",
      "method": "POST",
      "url": "{{baseUrl}}/users",
      "body": {
        "fullName": "John Doe",
        "email": "john@example.com",
        "password": "password123",
        "status": "online"
      }
    },
    {
      "name": "Get All Users",
      "method": "GET",
      "url": "{{baseUrl}}/users"
    }
  ]
}
```

---

## 🔒 Authentication (To Be Implemented)

Future endpoints with JWT authentication:

### POST /auth/register

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword123"
  }'
```

### POST /auth/login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "securepassword123"
  }'
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uuid": "...",
    "fullName": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

### Using Bearer Token

```bash
curl http://localhost:3000/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📊 Advanced Queries (Prisma Examples)

### Get User with Relations

```typescript
const user = await prisma.user.findUnique({
  where: { uuid: 'user-uuid' },
  include: {
    chats: true,
    reels: true,
    taskLists: true,
  },
});
```

### Get Chats with Creator Info

```typescript
const chats = await prisma.chat.findMany({
  include: {
    creator: {
      select: {
        uuid: true,
        fullName: true,
        email: true,
      },
    },
    group: true,
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10,
});
```

### Filter Tasks by Completion

```typescript
const incompleteTasks = await prisma.taskList.findMany({
  where: {
    createdBy: 'user-uuid',
    isCompleted: false,
  },
  orderBy: {
    createdAt: 'desc',
  },
});
```

---

## 🎯 Next Steps

1. ✅ Generate modules for remaining resources
2. ✅ Implement authentication with JWT
3. ✅ Add validation with DTOs
4. ✅ Add WebSocket for real-time chat
5. ✅ Add file upload for reels and group photos
6. ✅ Add pagination and filtering
7. ✅ Add comprehensive error handling

Happy coding! 🚀
