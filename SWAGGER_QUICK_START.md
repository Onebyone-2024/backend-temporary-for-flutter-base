# Swagger Quick Start Guide

## 🚀 Start Your Server

```bash
npm run start:dev
```

## 📚 Access Swagger Documentation

```
http://localhost:3000/api
```

---

## 🔐 Test Authentication

### 1️⃣ Register User

```json
POST /auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "John Doe",
    "email": "john@example.com",
    "status": "active",
    "createdAt": "2025-12-02T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

### 2️⃣ Login User

```json
POST /auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register

### 3️⃣ Authorize in Swagger

1. Click **🔓 Authorize** button (top right)
2. Paste token value: `Bearer <your-token-here>`
3. Click **Authorize** button
4. All protected endpoints now include JWT automatically

---

## 📋 Available Endpoints

### Authentication (Public)

- ✅ `POST /auth/register` - Create new user
- ✅ `POST /auth/login` - Login user

### Users (Protected by JWT)

- ✅ `GET /users` - List all users
- ✅ `GET /users/:id` - Get user by ID
- ✅ `POST /users` - Create user
- ✅ `PATCH /users/:id` - Update user
- ✅ `DELETE /users/:id` - Delete user

### Groups (Protected by JWT)

- ✅ `GET /groups` - List groups
- ✅ `GET /groups/:id` - Get group details
- ✅ `POST /groups` - Create group
- ✅ `PATCH /groups/:id` - Update group
- ✅ `DELETE /groups/:id` - Delete group

### Direct Chats (Protected by JWT)

- ✅ `GET /direct-chats` - List chats
- ✅ `GET /direct-chats/:id` - Get chat details
- ✅ `POST /direct-chats` - Create chat
- ✅ `GET /direct-chats/users/:uuid1/:uuid2` - Get chat between users

### Group Members (Protected by JWT)

- ✅ `POST /group-members` - Add member to group
- ✅ `GET /group-members` - List group members
- ✅ `GET /group-members/:id` - Get member details
- ✅ `DELETE /group-members/:id` - Remove member

### Group Chats (Protected by JWT)

- ✅ `GET /group-chats` - List messages
- ✅ `POST /group-chats` - Send message
- ✅ `GET /group-chats/:groupId` - Get messages by group

### Reels (Protected by JWT)

- ✅ `GET /reels` - List reels
- ✅ `POST /reels` - Create reel
- ✅ `GET /reels/:id` - Get reel details
- ✅ `GET /reels/user/:userId` - Get user's reels

### Task Lists (Protected by JWT)

- ✅ `GET /task-lists` - List tasks
- ✅ `POST /task-lists` - Create task
- ✅ `GET /task-lists/:id` - Get task details
- ✅ `PATCH /task-lists/:id` - Update task
- ✅ `DELETE /task-lists/:id` - Delete task

---

## 🎯 Example Workflow in Swagger

### Step 1: Register

```
1. Open: http://localhost:3000/api
2. Expand "Auth" section
3. Click "POST /auth/register"
4. Click "Try it out"
5. Enter:
   {
     "fullName": "Alice Smith",
     "email": "alice@example.com",
     "password": "securePassword123"
   }
6. Click "Execute"
7. Copy the "token" from response
```

### Step 2: Authorize

```
1. Click "🔓 Authorize" button (top right)
2. Paste in the value field: Bearer <copied-token>
3. Click "Authorize"
4. Click "Close"
```

### Step 3: Create a Group

```
1. Expand "Groups" section
2. Click "POST /groups"
3. Click "Try it out"
4. Enter:
   {
     "name": "Friends",
     "photo": "https://example.com/photo.jpg"
   }
5. Click "Execute"
6. Save the returned "id" (group UUID)
```

### Step 4: Add Member to Group

```
1. Expand "Group Members" section
2. Click "POST /group-members"
3. Click "Try it out"
4. Enter:
   {
     "groupUuid": "<group-id-from-step-3>",
     "userUuid": "<user-uuid>"
   }
5. Click "Execute"
```

### Step 5: Send Message in Group

```
1. Expand "Group Chats" section
2. Click "POST /group-chats"
3. Click "Try it out"
4. Enter:
   {
     "textMessage": "Hello everyone!",
     "createdBy": "<user-uuid>",
     "groupUuid": "<group-id>"
   }
5. Click "Execute"
```

---

## 💡 Tips & Tricks

### 📌 Keep Token Persistent

- Swagger UI remembers your JWT token across browser sessions
- The `persistAuthorization: true` setting enables this

### 🔍 Search Endpoints

- Use the search box in Swagger to find endpoints quickly
- Type endpoint name or tag (e.g., "groups", "auth")

### 📋 Download API Specification

- Click the download icon in Swagger UI
- Get OpenAPI/Swagger JSON file
- Share with frontend team

### 🧪 Test Error Cases

- Try sending invalid data to see error responses
- Try accessing protected endpoints without JWT
- Try using invalid JWT token

### 📱 Test with cURL

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get Users (with JWT)
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔧 Common Issues

| Issue                   | Solution                                                            |
| ----------------------- | ------------------------------------------------------------------- |
| "Cannot GET /api"       | Ensure app is running on correct port (default: 3000)               |
| Token not working       | Verify you clicked "Authorize" and token is prefixed with "Bearer " |
| CORS errors             | CORS is already enabled for all origins - should work               |
| "Unauthorized" response | Get a new token from `/auth/login` endpoint                         |
| "User not found"        | Register first using `/auth/register`                               |

---

## 📚 Swagger Documentation

See full documentation in: **SWAGGER_SETUP_GUIDE.md**

Key sections:

- How to document new endpoints
- Decorator reference
- Production considerations
- Troubleshooting

---

## ✨ What's Next?

1. ✅ Swagger is installed and running
2. ✅ Auth endpoints are documented
3. ✅ All CRUD endpoints are documented
4. ✅ You can test endpoints in Swagger UI

**Ready to build your frontend!** 🚀
