# 📮 Update Postman Collection for Direct Chat Messages

## 🔄 Required Changes to Postman

Your existing Postman collection has some issues. Here are the changes you need to make:

---

## ❌ REMOVE: Old Create Direct Chat

**Remove this request:**

```json
{
  "name": "Create Direct Chat",
  "request": {
    "method": "POST",
    "body": {
      "raw": "{\n  \"message\": \"Hello!\",\n  \"senderUuid\": \"{{userId}}\",\n  \"recipientUuid\": \"fc0939ea-078c-422a-99ed-c0c3927aa85a\"\n}"
    },
    "url": "{{baseUrl}}/direct-chats"
  }
}
```

---

## ✅ ADD: New Requests for Direct Chat Messages

### Request 1️⃣: Create Direct Chat

```json
{
  "name": "Create Direct Chat",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json"
      },
      {
        "key": "Authorization",
        "value": "Bearer {{token}}"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"uuid1\": \"{{userId}}\",\n  \"uuid2\": \"fc0939ea-078c-422a-99ed-c0c3927aa85a\"\n}"
    },
    "url": {
      "raw": "{{baseUrl}}/direct-chats",
      "host": ["{{baseUrl}}"],
      "path": ["direct-chats"]
    },
    "description": "Create a direct chat between two users"
  }
}
```

### Request 2️⃣: Send Message to Direct Chat

```json
{
  "name": "Send Message to Direct Chat",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json"
      },
      {
        "key": "Authorization",
        "value": "Bearer {{token}}"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"senderUuid\": \"{{userId}}\",\n  \"message\": \"Hello! How are you?\"\n}"
    },
    "url": {
      "raw": "{{baseUrl}}/direct-chats/{{chatUuid}}/messages",
      "host": ["{{baseUrl}}"],
      "path": ["direct-chats", "{{chatUuid}}", "messages"]
    },
    "description": "Send a message to a direct chat"
  },
  "response": []
}
```

### Request 3️⃣: Get All Messages in Chat

```json
{
  "name": "Get Messages from Direct Chat",
  "request": {
    "method": "GET",
    "header": [
      {
        "key": "Authorization",
        "value": "Bearer {{token}}"
      }
    ],
    "url": {
      "raw": "{{baseUrl}}/direct-chats/{{chatUuid}}/messages?limit=50&offset=0",
      "host": ["{{baseUrl}}"],
      "path": ["direct-chats", "{{chatUuid}}", "messages"],
      "query": [
        {
          "key": "limit",
          "value": "50"
        },
        {
          "key": "offset",
          "value": "0"
        }
      ]
    },
    "description": "Get all messages from a direct chat with pagination"
  },
  "response": []
}
```

### Request 4️⃣: Update Message

```json
{
  "name": "Update Direct Chat Message",
  "request": {
    "method": "PATCH",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json"
      },
      {
        "key": "Authorization",
        "value": "Bearer {{token}}"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"message\": \"Updated message text\"\n}"
    },
    "url": {
      "raw": "{{baseUrl}}/direct-chats/messages/{{messageUuid}}",
      "host": ["{{baseUrl}}"],
      "path": ["direct-chats", "messages", "{{messageUuid}}"]
    },
    "description": "Update a direct chat message"
  },
  "response": []
}
```

### Request 5️⃣: Delete Message

```json
{
  "name": "Delete Direct Chat Message",
  "request": {
    "method": "DELETE",
    "header": [
      {
        "key": "Authorization",
        "value": "Bearer {{token}}"
      }
    ],
    "url": {
      "raw": "{{baseUrl}}/direct-chats/messages/{{messageUuid}}",
      "host": ["{{baseUrl}}"],
      "path": ["direct-chats", "messages", "{{messageUuid}}"]
    },
    "description": "Delete a direct chat message"
  },
  "response": []
}
```

---

## 🎯 Complete Direct Chats Folder Structure

Your Postman **💬 Direct Chats** folder should now have:

```
💬 Direct Chats
├── Create Direct Chat
├── Get All Direct Chats
├── Get Chats Between Two Users
├── Get Direct Chat by UUID
├── Update Direct Chat
├── Delete Direct Chat
├── Send Message to Direct Chat        ← NEW
├── Get Messages from Direct Chat      ← NEW
├── Update Direct Chat Message         ← NEW
└── Delete Direct Chat Message         ← NEW
```

---

## 📝 Environment Variables to Add/Update

Add these to your Postman Environment:

```javascript
{
  "key": "chatUuid",
  "value": "550e8400-e29b-41d4-a716-446655440099",
  "type": "string"
}

{
  "key": "messageUuid",
  "value": "550e8400-e29b-41d4-a716-446655440100",
  "type": "string"
}
```

---

## 🧪 Testing Workflow

### Step 1: Create Direct Chat

1. Login first → save `{{token}}`
2. Use your user ID as `{{userId}}`
3. Request: **Create Direct Chat**
4. Save response `uuid` as `{{chatUuid}}`

### Step 2: Send Messages

1. Use **Send Message to Direct Chat**
2. Replace `{{chatUuid}}` with your chat UUID
3. Change `{{userId}}` to sender UUID
4. Save response `uuid` as `{{messageUuid}}`

### Step 3: Retrieve Messages

1. Use **Get Messages from Direct Chat**
2. See all messages with pagination
3. Adjust `limit` and `offset` as needed

### Step 4: Update Message

1. Use **Update Direct Chat Message**
2. Replace `{{messageUuid}}` with actual message UUID
3. Change message content in body

### Step 5: Delete Message

1. Use **Delete Direct Chat Message**
2. Replace `{{messageUuid}}\*\* with actual message UUID
3. Should return 204 No Content

---

## 🚀 Quick Copy-Paste

If you want to add these quickly, here's the raw JSON for the folder:

```json
{
  "name": "Send Message to Direct Chat",
  "item": [
    {
      "name": "Create Direct Chat",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" },
          { "key": "Authorization", "value": "Bearer {{token}}" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"uuid1\": \"{{userId}}\", \"uuid2\": \"fc0939ea-078c-422a-99ed-c0c3927aa85a\"}"
        },
        "url": {
          "raw": "{{baseUrl}}/direct-chats",
          "host": ["{{baseUrl}}"],
          "path": ["direct-chats"]
        }
      }
    },
    {
      "name": "Send Message to Direct Chat",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" },
          { "key": "Authorization", "value": "Bearer {{token}}" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"senderUuid\": \"{{userId}}\", \"message\": \"Hello!\"}"
        },
        "url": {
          "raw": "{{baseUrl}}/direct-chats/{{chatUuid}}/messages",
          "host": ["{{baseUrl}}"],
          "path": ["direct-chats", "{{chatUuid}}", "messages"]
        }
      }
    },
    {
      "name": "Get Messages from Direct Chat",
      "request": {
        "method": "GET",
        "header": [{ "key": "Authorization", "value": "Bearer {{token}}" }],
        "url": {
          "raw": "{{baseUrl}}/direct-chats/{{chatUuid}}/messages?limit=50&offset=0",
          "host": ["{{baseUrl}}"],
          "path": ["direct-chats", "{{chatUuid}}", "messages"],
          "query": [
            { "key": "limit", "value": "50" },
            { "key": "offset", "value": "0" }
          ]
        }
      }
    },
    {
      "name": "Update Direct Chat Message",
      "request": {
        "method": "PATCH",
        "header": [
          { "key": "Content-Type", "value": "application/json" },
          { "key": "Authorization", "value": "Bearer {{token}}" }
        ],
        "body": { "mode": "raw", "raw": "{\"message\": \"Updated message\"}" },
        "url": {
          "raw": "{{baseUrl}}/direct-chats/messages/{{messageUuid}}",
          "host": ["{{baseUrl}}"],
          "path": ["direct-chats", "messages", "{{messageUuid}}"]
        }
      }
    },
    {
      "name": "Delete Direct Chat Message",
      "request": {
        "method": "DELETE",
        "header": [{ "key": "Authorization", "value": "Bearer {{token}}" }],
        "url": {
          "raw": "{{baseUrl}}/direct-chats/messages/{{messageUuid}}",
          "host": ["{{baseUrl}}"],
          "path": ["direct-chats", "messages", "{{messageUuid}}"]
        }
      }
    }
  ]
}
```

---

## ✅ Verification Checklist

- [ ] Removed old "Create Direct Chat" with wrong payload
- [ ] Added "Send Message to Direct Chat"
- [ ] Added "Get Messages from Direct Chat"
- [ ] Added "Update Direct Chat Message"
- [ ] Added "Delete Direct Chat Message"
- [ ] Added `chatUuid` environment variable
- [ ] Added `messageUuid` environment variable
- [ ] Tested Create Direct Chat endpoint
- [ ] Tested Send Message endpoint
- [ ] Tested Get Messages endpoint
- [ ] Tested Update Message endpoint
- [ ] Tested Delete Message endpoint

---

## 🎯 Key Differences from Old Payload

| Old (❌ WRONG)         | New (✅ CORRECT)                               |
| ---------------------- | ---------------------------------------------- |
| Field: `message`       | Field: `senderUuid`                            |
| Field: `senderUuid`    | Field: `message`                               |
| Field: `recipientUuid` | Field: Not needed (use uuid2 in chat creation) |
| Endpoint creates chat  | Endpoint creates chat                          |
| Can't send messages    | Can send multiple messages                     |

---

## 📚 See Also

- `DIRECT_CHAT_MESSAGES_API.md` - Full API documentation
- `DIRECT_CHAT_IMPLEMENTATION_COMPLETE.md` - Implementation details
- `Complete_API_Collection.postman_collection.json` - Main collection file

---

**Last Updated:** December 3, 2025  
**Status:** ✅ Ready to Update Postman
