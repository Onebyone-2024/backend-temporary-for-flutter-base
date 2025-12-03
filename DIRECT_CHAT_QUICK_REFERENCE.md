# 🎯 Direct Chat Messages API - Quick Reference

## 📊 API Overview

```
Direct Chat System Architecture
════════════════════════════════════════════════════════════════

User A                                              User B
  │                                                   │
  │         1. Create Direct Chat                    │
  │──────────────────────────────────────────────────│
  │              (uuid1, uuid2)                      │
  │              ↓ Returns chatUuid                  │
  │                                                   │
  │    2. Send Message                               │
  ├──────────────────────────────────────────────────→
  │    (chatUuid, senderUuid, message)               │
  │    ↓ Returns messageUuid                         │
  │                                                   │
  │←──────────────────────────────────────────────────┤
  │    3. Retrieve Messages (with pagination)         │
  │    Can load history                               │
  │                                                   │
  │    4. Update/Delete Messages (optional)           │
  │────────────────────────────────────────────────────│
```

---

## 🔗 API Endpoints

### Chat Management

```
POST   /direct-chats
├─ Create direct chat between 2 users
├─ Body: { uuid1, uuid2 }
└─ Returns: Direct chat object

GET    /direct-chats
├─ Get all chats
└─ Returns: Array of chats

GET    /direct-chats/between/:uuid1/:uuid2
├─ Get specific conversation between 2 users
└─ Returns: Single chat object

GET    /direct-chats/:uuid
├─ Get single chat by UUID
└─ Returns: Chat object

PATCH  /direct-chats/:uuid
├─ Update chat info
├─ Body: { uuid1?, uuid2? }
└─ Returns: Updated chat

DELETE /direct-chats/:uuid
├─ Delete chat
└─ Returns: 204 No Content
```

### Message Management (🆕 NEW)

```
POST   /direct-chats/:directChatUuid/messages
├─ Send message to chat
├─ Body: { senderUuid, message }
├─ Status: 201 Created
└─ Returns: Message object with sender

GET    /direct-chats/:directChatUuid/messages
├─ Get messages with pagination
├─ Query: ?limit=50&offset=0
├─ Status: 200 OK
└─ Returns: { messages: [], pagination: {} }

PATCH  /direct-chats/messages/:messageUuid
├─ Update message content
├─ Body: { message }
└─ Returns: Updated message

DELETE /direct-chats/messages/:messageUuid
├─ Delete message
└─ Returns: 204 No Content
```

---

## 📝 Request/Response Examples

### 1. Create Direct Chat

```javascript
// Request
POST /direct-chats
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "uuid1": "user-a-uuid",
  "uuid2": "user-b-uuid"
}

// Response (201 Created)
{
  "uuid": "chat-uuid-1234",
  "uuid1": "user-a-uuid",
  "uuid2": "user-b-uuid",
  "createdAt": "2025-12-03T12:00:00Z",
  "user1": { "uuid": "...", "fullName": "User A", "email": "a@email.com" },
  "user2": { "uuid": "...", "fullName": "User B", "email": "b@email.com" }
}
```

### 2. Send Message

```javascript
// Request
POST /direct-chats/chat-uuid-1234/messages
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "senderUuid": "user-a-uuid",
  "message": "Hello! How are you?"
}

// Response (201 Created)
{
  "uuid": "msg-uuid-5678",
  "directChatUuid": "chat-uuid-1234",
  "senderUuid": "user-a-uuid",
  "message": "Hello! How are you?",
  "createdAt": "2025-12-03T12:05:00Z",
  "updatedAt": "2025-12-03T12:05:00Z",
  "sender": { "uuid": "user-a-uuid", "fullName": "User A", "email": "a@email.com" }
}
```

### 3. Get Messages

```javascript
// Request
GET /direct-chats/chat-uuid-1234/messages?limit=20&offset=0
Authorization: Bearer TOKEN

// Response (200 OK)
{
  "messages": [
    {
      "uuid": "msg-uuid-1",
      "directChatUuid": "chat-uuid-1234",
      "senderUuid": "user-a-uuid",
      "message": "Hello!",
      "createdAt": "2025-12-03T12:05:00Z",
      "sender": { "uuid": "...", "fullName": "User A" }
    },
    {
      "uuid": "msg-uuid-2",
      "directChatUuid": "chat-uuid-1234",
      "senderUuid": "user-b-uuid",
      "message": "Hi there!",
      "createdAt": "2025-12-03T12:06:00Z",
      "sender": { "uuid": "...", "fullName": "User B" }
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### 4. Update Message

```javascript
// Request
PATCH /direct-chats/messages/msg-uuid-1
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "message": "Updated: Hello! How are you?"
}

// Response (200 OK)
{
  "uuid": "msg-uuid-1",
  "message": "Updated: Hello! How are you?",
  "updatedAt": "2025-12-03T12:07:00Z",
  ...
}
```

### 5. Delete Message

```javascript
// Request
DELETE /direct-chats/messages/msg-uuid-1
Authorization: Bearer TOKEN

// Response (204 No Content)
(empty body)
```

---

## 🔐 Authentication

**All endpoints require JWT token:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

Get token via login:

```javascript
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## ✅ Validation Rules

| Field           | Rule                  | Example                                |
| --------------- | --------------------- | -------------------------------------- |
| `uuid1`         | Valid UUID            | `550e8400-e29b-41d4-a716-446655440001` |
| `uuid2`         | Valid UUID            | `550e8400-e29b-41d4-a716-446655440002` |
| `uuid1 ≠ uuid2` | Cannot chat with self | ✅ Different UUIDs                     |
| `senderUuid`    | Must be in chat       | ✅ uuid1 or uuid2                      |
| `message`       | Non-empty string      | ✅ "Hello!"                            |
| `limit`         | 1-1000, default 50    | ✅ 50                                  |
| `offset`        | ≥ 0, default 0        | ✅ 0                                   |

---

## 📊 Status Codes

| Code | Meaning      | When                                  |
| ---- | ------------ | ------------------------------------- |
| 201  | Created      | POST message sent                     |
| 200  | OK           | GET/PATCH successful                  |
| 204  | No Content   | DELETE successful                     |
| 400  | Bad Request  | Invalid input, self-chat, not in chat |
| 401  | Unauthorized | No/invalid JWT token                  |
| 404  | Not Found    | Chat/message doesn't exist            |

---

## 🚀 Workflow Steps

```
Step 1: LOGIN
└─ POST /auth/login
   └─ Save: token, userId

Step 2: CREATE CHAT
└─ POST /direct-chats
   └─ Body: { uuid1: userId, uuid2: otherUserId }
   └─ Save: chatUuid

Step 3: SEND MESSAGES
└─ POST /direct-chats/{chatUuid}/messages
   └─ Body: { senderUuid: userId, message: "text" }
   └─ Save: messageUuid (optional)

Step 4: LOAD HISTORY
└─ GET /direct-chats/{chatUuid}/messages?limit=50&offset=0
   └─ Load all messages
   └─ Use pagination for more

Step 5: MANAGE MESSAGES
├─ PATCH /direct-chats/messages/{messageUuid}
│  └─ Update message
└─ DELETE /direct-chats/messages/{messageUuid}
   └─ Delete message
```

---

## 🔌 cURL Quick Commands

```bash
# 1. Create chat
curl -X POST http://localhost:3000/direct-chats \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"uuid1":"A","uuid2":"B"}'

# 2. Send message
curl -X POST http://localhost:3000/direct-chats/CHAT_UUID/messages \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"senderUuid":"A","message":"Hello"}'

# 3. Get messages
curl -X GET "http://localhost:3000/direct-chats/CHAT_UUID/messages?limit=50&offset=0" \
  -H "Authorization: Bearer TOKEN"

# 4. Update message
curl -X PATCH http://localhost:3000/direct-chats/messages/MSG_UUID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Updated"}'

# 5. Delete message
curl -X DELETE http://localhost:3000/direct-chats/messages/MSG_UUID \
  -H "Authorization: Bearer TOKEN"
```

---

## 💻 JavaScript Example

```javascript
// Send message function
async function sendMessage(chatUuid, senderUuid, text, token) {
  const response = await fetch(
    `http://localhost:3000/direct-chats/${chatUuid}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderUuid,
        message: text,
      }),
    },
  );
  return response.json();
}

// Get messages function
async function getMessages(chatUuid, token, limit = 50, offset = 0) {
  const response = await fetch(
    `http://localhost:3000/direct-chats/${chatUuid}/messages?limit=${limit}&offset=${offset}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.json();
}
```

---

## 📱 Flutter/Dart Example

```dart
// Send message
Future<void> sendMessage(String chatUuid, String senderUuid, String text, String token) async {
  final response = await http.post(
    Uri.parse('http://localhost:3000/direct-chats/$chatUuid/messages'),
    headers: {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'senderUuid': senderUuid,
      'message': text,
    }),
  );
  if (response.statusCode != 201) throw Exception('Failed to send message');
}

// Get messages
Future<List<dynamic>> getMessages(String chatUuid, String token) async {
  final response = await http.get(
    Uri.parse('http://localhost:3000/direct-chats/$chatUuid/messages?limit=50&offset=0'),
    headers: { 'Authorization': 'Bearer $token' },
  );
  if (response.statusCode != 200) throw Exception('Failed to load messages');
  return jsonDecode(response.body)['messages'];
}
```

---

## 🎯 Testing Checklist

- [ ] Login and get JWT token
- [ ] Create direct chat with 2 different users
- [ ] Send message from user 1
- [ ] Send message from user 2
- [ ] Retrieve all messages (limit 10, offset 0)
- [ ] Update a message
- [ ] Delete a message
- [ ] Try pagination (limit 5, offset 0)
- [ ] Verify 404 when chat doesn't exist
- [ ] Verify 400 when sender not in chat

---

**API Status:** ✅ LIVE  
**Last Updated:** December 3, 2025  
**Version:** 1.0.0
