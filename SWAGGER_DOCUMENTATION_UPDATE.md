# Swagger Documentation Update

## Summary

All API endpoints have been enhanced with comprehensive Swagger/OpenAPI documentation including:

- ✅ Operation summaries and descriptions
- ✅ Request body examples with multiple scenarios
- ✅ Parameter documentation
- ✅ Query parameter documentation
- ✅ Response status codes and descriptions
- ✅ Example payloads for each endpoint

## Controllers Updated

### 1. **Users Controller** (`src/users/users.controller.ts`)

| Endpoint       | Method | Description         | Payload Example                                            |
| -------------- | ------ | ------------------- | ---------------------------------------------------------- |
| `/users`       | POST   | Create a new user   | `{ fullName, email, password, status?, bio?, avatar? }`    |
| `/users`       | GET    | Get all users       | -                                                          |
| `/users/:uuid` | GET    | Get a specific user | -                                                          |
| `/users/:uuid` | PATCH  | Update a user       | `{ fullName?, email?, password?, status?, bio?, avatar? }` |
| `/users/:uuid` | DELETE | Delete a user       | -                                                          |

**Key Features:**

- User registration with optional profile fields
- Full CRUD operations
- Proper validation decorators

### 2. **Direct Chats Controller** (`src/direct-chats/direct-chats.controller.ts`)

| Endpoint                                 | Method | Description                | Payload Example           |
| ---------------------------------------- | ------ | -------------------------- | ------------------------- |
| `/direct-chats`                          | POST   | Create a direct chat       | `{ uuid1, uuid2 }`        |
| `/direct-chats`                          | GET    | Get all direct chats       | -                         |
| `/direct-chats/between/:uuid1/:uuid2`    | GET    | Get chat between two users | -                         |
| `/direct-chats/:uuid`                    | GET    | Get a specific chat        | -                         |
| `/direct-chats/:uuid`                    | PATCH  | Update a chat              | `{ uuid1?, uuid2? }`      |
| `/direct-chats/:uuid`                    | DELETE | Delete a chat              | -                         |
| `/direct-chats/:directChatUuid/messages` | POST   | Send a message             | `{ senderUuid, message }` |
| `/direct-chats/:directChatUuid/messages` | GET    | Get chat messages          | Query: `limit, offset`    |
| `/direct-chats/messages/:messageUuid`    | PATCH  | Update a message           | `{ message }`             |
| `/direct-chats/messages/:messageUuid`    | DELETE | Delete a message           | -                         |

**Key Features:**

- Comprehensive messaging API
- Pagination support for messages
- Message editing and deletion

### 3. **Groups Controller** (`src/groups/groups.controller.ts`)

| Endpoint        | Method | Description          | Payload Example                                   |
| --------------- | ------ | -------------------- | ------------------------------------------------- |
| `/groups`       | POST   | Create a group       | `{ name, photo?, members?: [uuid1, uuid2, ...] }` |
| `/groups`       | GET    | Get all groups       | -                                                 |
| `/groups/:uuid` | GET    | Get a specific group | -                                                 |
| `/groups/:uuid` | PATCH  | Update a group       | `{ name?, photo? }`                               |
| `/groups/:uuid` | DELETE | Delete a group       | -                                                 |

**Key Features:**

- Create groups with initial members
- Auto-ignore duplicate members
- Proper member management

### 4. **Group Chats Controller** (`src/group-chats/group-chats.controller.ts`)

| Endpoint                        | Method | Description            | Payload Example                         |
| ------------------------------- | ------ | ---------------------- | --------------------------------------- |
| `/group-chats`                  | POST   | Create a message       | `{ textMessage, createdBy, groupUuid }` |
| `/group-chats`                  | GET    | Get all messages       | -                                       |
| `/group-chats/group/:groupUuid` | GET    | Get group messages     | Query: `limit`                          |
| `/group-chats/:uuid`            | GET    | Get a specific message | -                                       |
| `/group-chats/:uuid`            | PATCH  | Update a message       | `{ textMessage? }`                      |
| `/group-chats/:uuid`            | DELETE | Delete a message       | -                                       |

**Key Features:**

- Group messaging support
- Message editing and deletion
- Pagination support

### 5. **Group Members Controller** (`src/group-members/group-members.controller.ts`)

| Endpoint                                         | Method | Description            | Payload Example           |
| ------------------------------------------------ | ------ | ---------------------- | ------------------------- |
| `/group-members`                                 | POST   | Add member to group    | `{ groupUuid, userUuid }` |
| `/group-members`                                 | GET    | Get all members        | -                         |
| `/group-members/group/:groupUuid`                | GET    | Get group members      | -                         |
| `/group-members/:uuid`                           | GET    | Get a specific member  | -                         |
| `/group-members/:uuid`                           | DELETE | Remove a member        | -                         |
| `/group-members/group/:groupUuid/user/:userUuid` | DELETE | Remove user from group | -                         |

**Key Features:**

- Flexible member management
- Multiple removal methods
- Group-specific member queries

### 6. **Reels Controller** (`src/reels/reels.controller.ts`)

| Endpoint                 | Method | Description         | Payload Example                         |
| ------------------------ | ------ | ------------------- | --------------------------------------- |
| `/reels`                 | POST   | Create a reel       | `{ source, description?, createdBy }`   |
| `/reels`                 | GET    | Get all reels       | -                                       |
| `/reels/user/:createdBy` | GET    | Get user's reels    | -                                       |
| `/reels/:uuid`           | GET    | Get a specific reel | -                                       |
| `/reels/:uuid`           | PATCH  | Update a reel       | `{ source?, description?, createdBy? }` |
| `/reels/:uuid`           | DELETE | Delete a reel       | -                                       |
| `/reels/upload/:userId`  | POST   | Upload a reel file  | Form: `file, description?`              |

**Key Features:**

- File upload support
- User-specific queries
- Multipart form data handling

### 7. **Auth Controller** (`src/auth/auth.controller.ts`)

| Endpoint         | Method | Description   | Payload Example                 |
| ---------------- | ------ | ------------- | ------------------------------- |
| `/auth/register` | POST   | Register user | `{ fullName, email, password }` |
| `/auth/login`    | POST   | Login user    | `{ email, password }`           |

**Key Features:**

- JWT authentication
- Complete user registration
- Token-based login

## Swagger Documentation Features Added

### For All Endpoints:

1. **@ApiOperation()** - Summary and detailed descriptions
2. **@ApiBody()** - Request payload with real-world examples
3. **@ApiParam()** - Path parameter documentation
4. **@ApiQuery()** - Query parameter documentation with defaults
5. **@ApiResponse()** - Status codes and response descriptions
6. **@ApiConsumes()** - For file upload endpoints (multipart/form-data)

### Example Payloads Included:

- ✅ Multiple scenario examples for complex endpoints
- ✅ Real UUIDs in examples
- ✅ Realistic field values
- ✅ Optional vs required field indicators

## How to View Documentation

1. **Local Environment:**

   ```
   http://localhost:3001/api#/
   ```

2. **Each section is properly grouped by tag:**
   - Auth
   - Users
   - Direct Chats
   - Groups
   - Group Chats
   - Group Members
   - Reels

3. **Click on any endpoint to:**
   - See detailed description
   - View request schema with examples
   - View response schemas
   - Try it out with the "Try it out" button
   - Copy request as cURL

## Testing with Swagger UI

All endpoints can now be tested directly from the Swagger UI:

1. Navigate to `http://localhost:3001/api`
2. Select an endpoint
3. Click "Try it out"
4. Fill in the parameters/body (pre-populated examples provided)
5. Click "Execute"
6. View the response

## Notes

- All DTOs are properly documented
- Request bodies include realistic examples
- Parameters include proper type hints and descriptions
- Response codes are documented (201, 200, 204, 400, 401, etc.)
- File upload endpoints have proper multipart/form-data documentation
