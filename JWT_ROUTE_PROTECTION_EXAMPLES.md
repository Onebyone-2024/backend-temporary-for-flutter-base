# How to Protect Routes with JWT

This guide shows you how to apply JWT authentication to your existing API endpoints.

---

## Option 1: Protect Entire Controller

Apply the guard to the entire controller class to protect all routes:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  // All routes in this controller are now protected

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.usersService.findOne(uuid);
  }
}
```

---

## Option 2: Protect Individual Routes

Apply the guard to specific routes:

```typescript
import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  // This route is public
  @Get('public')
  getPublic() {
    return { message: 'Public endpoint' };
  }

  // This route is protected
  @Get(':uuid')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('uuid') uuid: string) {
    return this.usersService.findOne(uuid);
  }

  // This route is also protected
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }
}
```

---

## Option 3: Get Current User in Handler

Access the authenticated user in your route handler:

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  @Get('profile')
  getProfile(@Request() req) {
    // req.user contains the user object validated by JWT strategy
    return {
      message: 'Your profile',
      user: req.user,
      uuid: req.user.uuid,
      email: req.user.email,
      fullName: req.user.fullName,
    };
  }
}
```

---

## Option 4: Using Decorators (Recommended)

Create a custom decorator to extract the user from the request:

### 1. Create User Decorator

Create file: `src/auth/decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### 2. Use the Decorator

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UserProfileController {
  @Get('profile')
  getProfile(@CurrentUser() user) {
    return {
      message: 'Your profile',
      uuid: user.uuid,
      email: user.email,
      fullName: user.fullName,
    };
  }
}
```

---

## Protecting All Existing Modules

Here's how to protect your existing CRUD endpoints:

### Users Module

```typescript
// src/users/users.controller.ts
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  // All routes protected
}
```

### Direct Chats Module

```typescript
// src/direct-chats/direct-chats.controller.ts
@Controller('direct-chats')
@UseGuards(JwtAuthGuard)
export class DirectChatsController {
  // All routes protected
}
```

### Groups Module

```typescript
// src/groups/groups.controller.ts
@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  // All routes protected
}
```

### Group Members Module

```typescript
// src/group-members/group-members.controller.ts
@Controller('group-members')
@UseGuards(JwtAuthGuard)
export class GroupMembersController {
  // All routes protected
}
```

### Group Chats Module

```typescript
// src/group-chats/group-chats.controller.ts
@Controller('group-chats')
@UseGuards(JwtAuthGuard)
export class GroupChatsController {
  // All routes protected
}
```

### Reels Module

```typescript
// src/reels/reels.controller.ts
@Controller('reels')
@UseGuards(JwtAuthGuard)
export class ReelsController {
  // All routes protected
}
```

### Task Lists Module

```typescript
// src/task-lists/task-lists.controller.ts
@Controller('task-lists')
@UseGuards(JwtAuthGuard)
export class TaskListsController {
  // All routes protected
}
```

---

## Testing Protected Routes

### 1. Get the JWT Token

First, register or login to get a token:

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Or Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. Use Token in Requests

```bash
# Store token in variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Make authenticated request
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/users

# Get current user profile
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/me/profile

# Create a task
curl -X POST http://localhost:3000/task-lists \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "uuidUser": "user-uuid",
    "task": "Buy groceries",
    "isCompleted": false
  }'
```

---

## Error Responses

### Missing Token

```
Status: 401 Unauthorized
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Invalid Token

```
Status: 401 Unauthorized
{
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

### Expired Token

```
Status: 401 Unauthorized
{
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

---

## Import Statements Needed

For any file that uses the JWT guard:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Or if using custom decorator:
import { CurrentUser } from '../auth/decorators/current-user.decorator';
```

---

## Best Practices

✅ Protect all endpoints except `/auth/register` and `/auth/login`
✅ Use `@CurrentUser()` decorator to get authenticated user
✅ Always validate user ownership before updating/deleting resources
✅ Log authentication failures for security monitoring
✅ Use HTTPS in production to protect tokens in transit
✅ Store tokens securely on client side (httpOnly cookies recommended)

---

## Example: Protecting a Resource

Only allow users to modify their own resources:

```typescript
import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('task-lists')
@UseGuards(JwtAuthGuard)
export class TaskListsController {
  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateTaskListDto,
    @CurrentUser() user,
  ) {
    // Get the task to check ownership
    const task = this.taskListsService.findOne(uuid);

    // Only allow if user owns the task
    if (task.uuidUser !== user.uuid) {
      throw new ForbiddenException('You can only update your own tasks');
    }

    return this.taskListsService.update(uuid, updateDto);
  }
}
```

---

This approach ensures your API is secure while allowing authenticated users to access the resources they need!
