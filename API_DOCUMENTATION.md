# CRUD API Documentation

## Overview

This document provides a comprehensive guide to all CRUD APIs available in the backend.

---

## 1. Users API

### Base URL: `/users`

#### Create User

- **Method:** POST
- **Endpoint:** `/users`
- **Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "status": "online"
}
```

- **Response:** User object with uuid, fullName, email, status, createdAt

#### Get All Users

- **Method:** GET
- **Endpoint:** `/users`
- **Response:** Array of user objects

#### Get User by UUID

- **Method:** GET
- **Endpoint:** `/users/{uuid}`
- **Response:** User object

#### Update User

- **Method:** PATCH
- **Endpoint:** `/users/{uuid}`
- **Body:** Partial user object
- **Response:** Updated user object

#### Delete User

- **Method:** DELETE
- **Endpoint:** `/users/{uuid}`
- **Response:** 204 No Content

---

## 2. Direct Chats API

### Base URL: `/direct-chats`

#### Create Direct Chat

- **Method:** POST
- **Endpoint:** `/direct-chats`
- **Body:**

```json
{
  "uuid1": "user-uuid-1",
  "uuid2": "user-uuid-2"
}
```

- **Response:** DirectChat object with user details

#### Get All Direct Chats

- **Method:** GET
- **Endpoint:** `/direct-chats`
- **Response:** Array of DirectChat objects

#### Get Direct Chat by UUID

- **Method:** GET
- **Endpoint:** `/direct-chats/{uuid}`
- **Response:** DirectChat object

#### Find Direct Chat Between Two Users

- **Method:** GET
- **Endpoint:** `/direct-chats/between/{uuid1}/{uuid2}`
- **Response:** DirectChat object or null

#### Update Direct Chat

- **Method:** PATCH
- **Endpoint:** `/direct-chats/{uuid}`
- **Body:** Partial DirectChat object
- **Response:** Updated DirectChat object

#### Delete Direct Chat

- **Method:** DELETE
- **Endpoint:** `/direct-chats/{uuid}`
- **Response:** 204 No Content

---

## 3. Groups API

### Base URL: `/groups`

#### Create Group

- **Method:** POST
- **Endpoint:** `/groups`
- **Body:**

```json
{
  "name": "Friends Group",
  "photo": "url-to-photo"
}
```

- **Response:** Group object with members and recent chats

#### Get All Groups

- **Method:** GET
- **Endpoint:** `/groups`
- **Response:** Array of Group objects with members and chats

#### Get Group by UUID

- **Method:** GET
- **Endpoint:** `/groups/{uuid}`
- **Response:** Group object with all members and chats

#### Update Group

- **Method:** PATCH
- **Endpoint:** `/groups/{uuid}`
- **Body:** Partial group object
- **Response:** Updated Group object

#### Delete Group

- **Method:** DELETE
- **Endpoint:** `/groups/{uuid}`
- **Response:** 204 No Content

---

## 4. Group Members API

### Base URL: `/group-members`

#### Add Member to Group

- **Method:** POST
- **Endpoint:** `/group-members`
- **Body:**

```json
{
  "groupUuid": "group-uuid",
  "userUuid": "user-uuid"
}
```

- **Response:** GroupMember object with user details

#### Get All Group Members

- **Method:** GET
- **Endpoint:** `/group-members`
- **Response:** Array of GroupMember objects

#### Get Members of a Specific Group

- **Method:** GET
- **Endpoint:** `/group-members/group/{groupUuid}`
- **Response:** Array of GroupMember objects for the group

#### Get Group Member by UUID

- **Method:** GET
- **Endpoint:** `/group-members/{uuid}`
- **Response:** GroupMember object

#### Remove Member from Group (by Member UUID)

- **Method:** DELETE
- **Endpoint:** `/group-members/{uuid}`
- **Response:** 204 No Content

#### Remove Member from Group (by Group and User UUID)

- **Method:** DELETE
- **Endpoint:** `/group-members/group/{groupUuid}/user/{userUuid}`
- **Response:** 204 No Content

---

## 5. Group Chats API

### Base URL: `/group-chats`

#### Create Group Chat Message

- **Method:** POST
- **Endpoint:** `/group-chats`
- **Body:**

```json
{
  "textMessage": "Hello everyone!",
  "createdBy": "user-uuid",
  "groupUuid": "group-uuid"
}
```

- **Response:** GroupChat object with creator and group info

#### Get All Group Chats

- **Method:** GET
- **Endpoint:** `/group-chats`
- **Response:** Array of GroupChat objects

#### Get Chat Messages for a Specific Group

- **Method:** GET
- **Endpoint:** `/group-chats/group/{groupUuid}`
- **Query Parameters:**
  - `limit` (optional): Number of messages to retrieve (default: 50)
- **Response:** Array of GroupChat objects for the group

#### Get Group Chat by UUID

- **Method:** GET
- **Endpoint:** `/group-chats/{uuid}`
- **Response:** GroupChat object

#### Update Group Chat

- **Method:** PATCH
- **Endpoint:** `/group-chats/{uuid}`
- **Body:** Partial GroupChat object
- **Response:** Updated GroupChat object

#### Delete Group Chat

- **Method:** DELETE
- **Endpoint:** `/group-chats/{uuid}`
- **Response:** 204 No Content

---

## 6. Reels API

### Base URL: `/reels`

#### Create Reel

- **Method:** POST
- **Endpoint:** `/reels`
- **Body:**

```json
{
  "description": "My awesome reel",
  "source": "url-to-video",
  "createdBy": "user-uuid"
}
```

- **Response:** Reel object with creator info

#### Get All Reels

- **Method:** GET
- **Endpoint:** `/reels`
- **Response:** Array of Reel objects

#### Get Reels by User

- **Method:** GET
- **Endpoint:** `/reels/user/{createdBy}`
- **Response:** Array of Reel objects created by the user

#### Get Reel by UUID

- **Method:** GET
- **Endpoint:** `/reels/{uuid}`
- **Response:** Reel object

#### Update Reel

- **Method:** PATCH
- **Endpoint:** `/reels/{uuid}`
- **Body:** Partial Reel object
- **Response:** Updated Reel object

#### Delete Reel

- **Method:** DELETE
- **Endpoint:** `/reels/{uuid}`
- **Response:** 204 No Content

---

## 7. Task Lists API

### Base URL: `/task-lists`

#### Create Task

- **Method:** POST
- **Endpoint:** `/task-lists`
- **Body:**

```json
{
  "uuidUser": "user-uuid",
  "task": "Buy groceries",
  "isCompleted": false
}
```

- **Response:** TaskList object with user info

#### Get All Tasks

- **Method:** GET
- **Endpoint:** `/task-lists`
- **Response:** Array of TaskList objects

#### Get Tasks for a Specific User

- **Method:** GET
- **Endpoint:** `/task-lists/user/{uuidUser}`
- **Response:** Array of TaskList objects for the user

#### Get Task by UUID

- **Method:** GET
- **Endpoint:** `/task-lists/{uuid}`
- **Response:** TaskList object

#### Update Task

- **Method:** PATCH
- **Endpoint:** `/task-lists/{uuid}`
- **Body:** Partial TaskList object
- **Response:** Updated TaskList object

#### Delete Task

- **Method:** DELETE
- **Endpoint:** `/task-lists/{uuid}`
- **Response:** 204 No Content

---

## Response Format

### Success Response

```json
{
  "uuid": "unique-identifier",
  "field1": "value1",
  "field2": "value2",
  "createdAt": "2024-12-02T10:30:00Z"
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "BadRequest"
}
```

### Common HTTP Status Codes

- `200 OK`: Successful GET/PATCH request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Validation error
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Authentication & Validation

### Validators Used

- `@IsUUID()`: Validates UUID format
- `@IsEmail()`: Validates email format
- `@IsNotEmpty()`: Validates required fields
- `@IsString()`: Validates string type
- `@IsBoolean()`: Validates boolean type
- `@MinLength()`: Validates minimum length
- `@IsOptional()`: Marks field as optional

### Error Handling

All endpoints include proper error handling with:

- 404 Not Found for missing resources
- 400 Bad Request for invalid input
- 409 Conflict for duplicate entries (e.g., duplicate group members)

---

## Example Usage

### Create a Group and Add Members

```bash
# 1. Create a group
curl -X POST http://localhost:3000/groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Group",
    "photo": "https://example.com/photo.jpg"
  }'

# 2. Add members to the group
curl -X POST http://localhost:3000/group-members \
  -H "Content-Type: application/json" \
  -d '{
    "groupUuid": "group-uuid-from-step-1",
    "userUuid": "user-uuid-1"
  }'

# 3. Send a message to the group
curl -X POST http://localhost:3000/group-chats \
  -H "Content-Type: application/json" \
  -d '{
    "textMessage": "Hello everyone!",
    "createdBy": "user-uuid-1",
    "groupUuid": "group-uuid-from-step-1"
  }'

# 4. Get all messages in the group
curl http://localhost:3000/group-chats/group/group-uuid-from-step-1
```

---

## Notes

- All UUIDs should be in standard UUID v4 format
- Timestamps are returned in ISO 8601 format
- Pagination is not yet implemented; use query parameters for filtering
- All endpoints require valid input validation
- Deleted resources cascade to related entities (enforced at database level)
