# 💬 Direct Chat Messages API Documentation

## Overview

The Direct Chat Messages API allows users to send, retrieve, update, and delete messages within a direct chat conversation between two users.

---

## 🔄 API Endpoints

### 1️⃣ **Send Message to Direct Chat**

**`POST {{baseUrl}}/direct-chats/:directChatUuid/messages`**

Sends a new message to a direct chat conversation.

**Path Parameters:**

- `directChatUuid` - UUID of the direct chat

**Request Body:**

```json
{
  "senderUuid": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Hello! How are you?"
}
```

**Validations:**

- ✅ senderUuid must be a valid UUID
- ✅ senderUuid must be part of the direct chat (uuid1 or uuid2)
- ✅ message cannot be empty
- ✅ Direct chat must exist

**Response (201 Created):**

```json
{
  "uuid": "msg-uuid-1234",
  "directChatUuid": "chat-uuid-5678",
  "senderUuid": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Hello! How are you?",
  "createdAt": "2025-12-03T10:30:00Z",
  "updatedAt": "2025-12-03T10:30:00Z",
  "sender": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "John Doe",
    "email": "john@example.com"
  },
  "directChat": {
    "uuid": "chat-uuid-5678",
    "user1": {
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "fullName": "John Doe"
    },
    "user2": {
      "uuid": "550e8400-e29b-41d4-a716-446655440001",
      "fullName": "Jane Smith"
    }
  }
}
```

**Error Responses:**

- `404` - Direct chat not found
- `404` - Sender user not found
- `400` - Sender is not part of this direct chat
- `400` - Message cannot be empty

---

### 2️⃣ **Get All Messages in Direct Chat**

**`GET {{baseUrl}}/direct-chats/:directChatUuid/messages`**

Retrieves all messages from a direct chat with pagination.

**Path Parameters:**

- `directChatUuid` - UUID of the direct chat

**Query Parameters:**

- `limit` (optional, default: 50) - Maximum number of messages to return
- `offset` (optional, default: 0) - Number of messages to skip

**Example URL:**

```
GET {{baseUrl}}/direct-chats/chat-uuid-5678/messages?limit=20&offset=0
```

**Response (200 OK):**

```json
{
  "messages": [
    {
      "uuid": "msg-uuid-1",
      "directChatUuid": "chat-uuid-5678",
      "senderUuid": "550e8400-e29b-41d4-a716-446655440000",
      "message": "Hello!",
      "createdAt": "2025-12-03T10:30:00Z",
      "updatedAt": "2025-12-03T10:30:00Z",
      "sender": {
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "fullName": "John Doe",
        "email": "john@example.com"
      }
    },
    {
      "uuid": "msg-uuid-2",
      "directChatUuid": "chat-uuid-5678",
      "senderUuid": "550e8400-e29b-41d4-a716-446655440001",
      "message": "Hi John!",
      "createdAt": "2025-12-03T10:31:00Z",
      "updatedAt": "2025-12-03T10:31:00Z",
      "sender": {
        "uuid": "550e8400-e29b-41d4-a716-446655440001",
        "fullName": "Jane Smith",
        "email": "jane@example.com"
      }
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

**Error Responses:**

- `404` - Direct chat not found

---

### 3️⃣ **Update Message**

**`PATCH {{baseUrl}}/direct-chats/messages/:messageUuid`**

Updates the content of a message.

**Path Parameters:**

- `messageUuid` - UUID of the message to update

**Request Body:**

```json
{
  "message": "Updated message text"
}
```

**Response (200 OK):**

```json
{
  "uuid": "msg-uuid-1234",
  "directChatUuid": "chat-uuid-5678",
  "senderUuid": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Updated message text",
  "createdAt": "2025-12-03T10:30:00Z",
  "updatedAt": "2025-12-03T10:35:00Z",
  "sender": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**

- `404` - Message not found

---

### 4️⃣ **Delete Message**

**`DELETE {{baseUrl}}/direct-chats/messages/:messageUuid`**

Deletes a message from the direct chat.

**Path Parameters:**

- `messageUuid` - UUID of the message to delete

**Response (204 No Content):**

```
(empty body)
```

**Error Responses:**

- `404` - Message not found

---

## 📝 Database Schema

```sql
CREATE TABLE direct_chat_messages (
  uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direct_chat_uuid UUID NOT NULL REFERENCES direct_chats(uuid) ON DELETE CASCADE,
  sender_uuid UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE,
  text_message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),

  -- Indexes for performance
  INDEX idx_direct_chat_uuid (direct_chat_uuid),
  INDEX idx_sender_uuid (sender_uuid)
);
```

---

## 🔐 Authentication

✅ All endpoints require JWT Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 💡 Usage Examples

### cURL

```bash
# 1. Send a message
curl -X POST http://localhost:3000/direct-chats/chat-uuid-5678/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "senderUuid": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Hello! How are you?"
  }'

# 2. Get all messages (with pagination)
curl -X GET "http://localhost:3000/direct-chats/chat-uuid-5678/messages?limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Update a message
curl -X PATCH http://localhost:3000/direct-chats/messages/msg-uuid-1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Updated message"
  }'

# 4. Delete a message
curl -X DELETE http://localhost:3000/direct-chats/messages/msg-uuid-1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### JavaScript/Fetch

```javascript
// Send a message
async function sendMessage(chatUuid, senderUuid, messageText, token) {
  const response = await fetch(
    `http://localhost:3000/direct-chats/${chatUuid}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        senderUuid,
        message: messageText,
      }),
    },
  );
  return response.json();
}

// Get messages
async function getMessages(chatUuid, token, limit = 50, offset = 0) {
  const response = await fetch(
    `http://localhost:3000/direct-chats/${chatUuid}/messages?limit=${limit}&offset=${offset}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.json();
}
```

### Flutter/Dart

```dart
// Send a message
Future<void> sendMessage(
  String chatUuid,
  String senderUuid,
  String message,
  String token,
) async {
  final response = await http.post(
    Uri.parse('http://localhost:3000/direct-chats/$chatUuid/messages'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
    body: jsonEncode({
      'senderUuid': senderUuid,
      'message': message,
    }),
  );

  if (response.statusCode != 201) {
    throw Exception('Failed to send message: ${response.body}');
  }
}

// Get messages
Future<Map<String, dynamic>> getMessages(
  String chatUuid,
  String token, {
  int limit = 50,
  int offset = 0,
}) async {
  final response = await http.get(
    Uri.parse(
      'http://localhost:3000/direct-chats/$chatUuid/messages?limit=$limit&offset=$offset',
    ),
    headers: {'Authorization': 'Bearer $token'},
  );

  if (response.statusCode != 200) {
    throw Exception('Failed to load messages: ${response.body}');
  }

  return jsonDecode(response.body);
}
```

---

## ✅ Complete Workflow

```
1. Create Direct Chat
   POST /direct-chats
   └─> Returns: directChatUuid

2. Send Messages
   POST /direct-chats/{directChatUuid}/messages
   POST /direct-chats/{directChatUuid}/messages
   └─> Returns: messageUuid

3. Get Message History
   GET /direct-chats/{directChatUuid}/messages?limit=50&offset=0
   └─> Returns: Array of messages with pagination

4. Update Message (if needed)
   PATCH /direct-chats/messages/{messageUuid}
   └─> Returns: Updated message

5. Delete Message (if needed)
   DELETE /direct-chats/messages/{messageUuid}
   └─> Returns: 204 No Content
```

---

## 📊 Response Status Codes

| Code | Meaning                             | Example                    |
| ---- | ----------------------------------- | -------------------------- |
| 201  | Created - Message sent successfully | POST send message          |
| 200  | OK - Request successful             | GET messages, PATCH update |
| 204  | No Content - Deleted successfully   | DELETE message             |
| 400  | Bad Request - Invalid input         | Sender not in chat         |
| 404  | Not Found - Resource doesn't exist  | Chat/message not found     |
| 401  | Unauthorized - No/invalid token     | Missing Bearer token       |

---

## 🚀 Performance Considerations

✅ **Indexed Fields:**

- `direct_chat_uuid` - Fast message lookup by chat
- `sender_uuid` - Fast message lookup by sender

✅ **Pagination:**

- Default limit: 50 messages
- Prevent loading entire conversation at once
- Use offset for fetching older messages

✅ **Query Optimization:**

- Messages ordered by createdAt (ascending)
- Sender details included in response
- Total count available for UI pagination

---

## 📌 Important Notes

1. **Sender Validation**: Sender must be one of the two users in the direct chat
2. **Message Immutability**: Once deleted, a message cannot be recovered
3. **Pagination**: Always use pagination for better performance
4. **Real-time**: Currently polling-based; WebSocket support can be added
5. **User Context**: Frontend should validate sender is current logged-in user

---

## 🔄 Migration Info

**Created on:** December 3, 2025  
**Migration Name:** `20251203045423_add_direct_chat_messages`  
**Status:** ✅ Applied Successfully

---

**Last Updated:** December 3, 2025  
**Status:** ✅ Ready for Use
