# JWT Authentication & CORS Configuration Guide

## Installation

First, install the required dependencies:

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/bcrypt @types/passport-jwt
```

## Environment Variables

Add the following to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development
```

## Features Implemented

### 1. CORS Configuration (All IPs Whitelisted)

The CORS is configured in `src/main.ts` to allow requests from all origins:

```typescript
app.enableCors({
  origin: true, // Allow all origins
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
});
```

**Allowed:**

- All origins/IPs
- All HTTP methods
- Custom headers (Authorization, Content-Type)
- Credentials in requests

### 2. JWT Authentication

#### JWT Modules

- **@nestjs/jwt**: Handles token signing and verification
- **Passport & Passport-JWT**: Provides authentication strategy
- **bcrypt**: Secure password hashing

#### Files Created

1. **Auth Module** (`src/auth/auth.module.ts`)
   - Configures JWT with dynamic secret from environment
   - Registers Passport strategy
   - Exports AuthService for use in other modules

2. **Auth Service** (`src/auth/auth.service.ts`)
   - `register(registerDto)`: Creates new user with hashed password
   - `login(loginDto)`: Authenticates user and returns JWT token
   - `validateToken(token)`: Verifies token validity
   - `validateUser(uuid)`: Used by JWT strategy to get user details

3. **Auth Controller** (`src/auth/auth.controller.ts`)
   - `POST /auth/register`: User registration
   - `POST /auth/login`: User login

4. **JWT Strategy** (`src/auth/strategies/jwt.strategy.ts`)
   - Extracts JWT from `Authorization: Bearer <token>` header
   - Validates token signature and expiration
   - Validates user exists in database

5. **JWT Auth Guard** (`src/auth/guards/jwt-auth.guard.ts`)
   - Protects endpoints that require authentication
   - Can be applied to controllers/routes

6. **DTOs**
   - `LoginDto`: Email and password validation
   - `RegisterDto`: Full name, email, and password validation

---

## API Endpoints

### Authentication Endpoints

#### 1. Register User

**Endpoint:** `POST /auth/register`

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201 Created):**

```json
{
  "message": "User registered successfully",
  "user": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "John Doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response:**

```json
{
  "statusCode": 400,
  "message": "User with this email already exists",
  "error": "Bad Request"
}
```

#### 2. Login User

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**

```json
{
  "message": "Login successful",
  "user": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "John Doe",
    "email": "john@example.com",
    "status": "online"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response:**

```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

---

## Using JWT with Protected Endpoints

### 1. Apply JWT Guard to Controller

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('protected-route')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get()
  getProtected() {
    return { message: 'This is protected' };
  }
}
```

### 2. Making Authenticated Requests

**Request Header:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example with curl:**

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/protected-route
```

### 3. Get Current User in Handler

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class UserController {
  @Get()
  getCurrentUser(@Request() req) {
    return {
      message: 'Current user info',
      user: req.user,
    };
  }
}
```

---

## Password Security

### Hashing

- Passwords are hashed using **bcrypt** with salt rounds of 10
- Passwords in database are never stored in plain text

### Comparison

- Login endpoint compares provided password with hashed password in database
- Comparison is done securely using `bcrypt.compare()`

---

## Token Claims

The JWT token contains the following claims:

```json
{
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "iat": 1701513600,
  "exp": 1701600000
}
```

- `uuid`: User unique identifier
- `email`: User email address
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (24 hours by default)

---

## CORS Configuration Details

### What's Allowed

| Feature     | Setting                                      |
| ----------- | -------------------------------------------- |
| Origins     | All (`*`)                                    |
| Methods     | GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS |
| Headers     | Content-Type, Authorization                  |
| Credentials | Yes                                          |

### Production Recommendation

For production, consider restricting origins:

```typescript
app.enableCors({
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
});
```

---

## Error Handling

### Invalid Token

- **Status:** 401 Unauthorized
- **Message:** Invalid or expired token

### Missing Token

- **Status:** 401 Unauthorized
- **Message:** Unauthorized (when token is not provided)

### Invalid Credentials

- **Status:** 401 Unauthorized
- **Message:** Invalid email or password

### User Not Found

- **Status:** 404 Not Found
- **Message:** User not found

### Duplicate Email

- **Status:** 400 Bad Request
- **Message:** User with this email already exists

---

## Testing the Auth Flow

### 1. Register a new user

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. Get the JWT token from response and login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Use the token for authenticated requests

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/users
```

---

## Next Steps

1. Update environment variables with secure JWT secret
2. Apply `@UseGuards(JwtAuthGuard)` to protected endpoints
3. Use `@Request()` decorator to get current user in handlers
4. Configure CORS for specific domains in production
5. Consider implementing refresh tokens for better security

---

## Security Best Practices

✅ Passwords hashed with bcrypt (10 salt rounds)
✅ JWT tokens signed with secret key
✅ CORS configured to allow all requests
✅ Authorization header validation
✅ Token expiration set to 24 hours
✅ Email uniqueness enforced
⚠️ Change JWT_SECRET in production!
⚠️ Use HTTPS in production!
⚠️ Consider restricting CORS origins in production!
