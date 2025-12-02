# Swagger API Documentation Setup Guide

## 📚 Overview

Your NestJS backend now includes **Swagger/OpenAPI** documentation that provides:

- Interactive API explorer
- Request/response examples
- Authentication token management
- Test endpoints directly from browser
- Complete API specification

## 🚀 Quick Start

### Access Swagger UI

```
http://localhost:3000/api
```

### What's Available

1. **Interactive API Testing** - Try endpoints directly in browser
2. **Complete Documentation** - All endpoints, parameters, and responses documented
3. **Authentication** - Add JWT token for protected endpoints
4. **Model Schemas** - See data structures for requests/responses

---

## 🔐 Using JWT in Swagger

### Step 1: Get a JWT Token

1. Go to **Auth** section → **POST /auth/register**
2. Click "Try it out"
3. Enter:
   ```json
   {
     "fullName": "Test User",
     "email": "test@example.com",
     "password": "password123"
   }
   ```
4. Click "Execute"
5. Copy the `token` from response

### Step 2: Authorize Requests

1. Look for the **🔓 Authorize** button at top of Swagger UI
2. Click it
3. Paste your JWT token in the value field: `Bearer <your-token-here>`
4. Click "Authorize"
5. All subsequent requests will include your JWT token

---

## 📝 Documented Endpoints

### Auth Endpoints (Public)

- `POST /auth/register` - Create new user account
- `POST /auth/login` - Login and get JWT token

### Protected Endpoints (Require JWT)

- Users CRUD operations
- Groups management
- Group members management
- Group chats
- Direct chats
- Reels
- Task lists

---

## 🎨 Swagger Configuration Details

### Main Setup (src/main.ts)

```typescript
const config = new DocumentBuilder()
  .setTitle('Social Media Backend API')
  .setDescription('Complete REST API for social media platform...')
  .setVersion('1.0.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
    'JWT',
  )
  .addTag('Auth', 'User registration and login')
  .addTag('Users', 'User management')
  // ... more tags
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true,
    filter: true,
    showRequestHeaders: true,
    docExpansion: 'list',
  },
});
```

### Controller Documentation (src/auth/auth.controller.ts)

```typescript
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account...',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered...',
  })
  async register(@Body() registerDto: RegisterDto) {
    // ...
  }
}
```

### DTO Documentation

```typescript
export class LoginDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
```

---

## 📖 How to Document Your Endpoints

### Basic Endpoint Documentation

```typescript
@Get(':id')
@ApiOperation({
  summary: 'Get user by ID',
  description: 'Retrieve a user by their UUID',
})
@ApiParam({
  name: 'id',
  description: 'User UUID',
  example: '550e8400-e29b-41d4-a716-446655440000',
})
@ApiResponse({
  status: 200,
  description: 'User found',
  schema: {
    example: {
      uuid: '550e8400-e29b-41d4-a716-446655440000',
      fullName: 'John Doe',
      email: 'john@example.com',
    },
  },
})
@ApiResponse({
  status: 404,
  description: 'User not found',
})
async findOne(@Param('id') id: string) {
  return this.usersService.findOne(id);
}
```

### Protected Endpoint Documentation

```typescript
@Get()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
@ApiOperation({
  summary: 'Get all users',
  description: 'Retrieve all users (requires JWT authentication)',
})
@ApiResponse({
  status: 200,
  description: 'List of users',
})
async findAll() {
  return this.usersService.findAll();
}
```

### With Query Parameters

```typescript
@Get('search')
@ApiQuery({
  name: 'email',
  description: 'User email to search',
  example: 'john@example.com',
  required: false,
})
@ApiQuery({
  name: 'status',
  description: 'User status filter',
  enum: ['active', 'inactive'],
  required: false,
})
async search(
  @Query('email') email?: string,
  @Query('status') status?: string,
) {
  // implementation
}
```

---

## 🎯 Common Decorators Reference

### Operation Decorators

| Decorator               | Purpose                                   |
| ----------------------- | ----------------------------------------- |
| `@ApiTags('Tag')`       | Add endpoint to a tag group               |
| `@ApiOperation({...})`  | Document operation (summary, description) |
| `@ApiBearerAuth('JWT')` | Mark endpoint as JWT protected            |
| `@ApiExcludeEndpoint()` | Hide endpoint from Swagger                |

### Response Decorators

| Decorator                          | Purpose                               |
| ---------------------------------- | ------------------------------------- |
| `@ApiResponse({status: 200, ...})` | Document response with status code    |
| `@ApiOkResponse({...})`            | Alias for @ApiResponse({status: 200}) |
| `@ApiCreatedResponse({...})`       | Alias for @ApiResponse({status: 201}) |
| `@ApiBadRequestResponse({...})`    | Alias for @ApiResponse({status: 400}) |
| `@ApiUnauthorizedResponse({...})`  | Alias for @ApiResponse({status: 401}) |
| `@ApiNotFoundResponse({...})`      | Alias for @ApiResponse({status: 404}) |

### Parameter Decorators

| Decorator                            | Purpose                   |
| ------------------------------------ | ------------------------- |
| `@ApiParam({name: 'id', ...})`       | Document path parameter   |
| `@ApiQuery({name: 'limit', ...})`    | Document query parameter  |
| `@ApiHeader({name: 'X-Token', ...})` | Document header parameter |
| `@ApiBody({type: CreateUserDto})`    | Document request body     |

### Property Decorators (DTOs)

| Decorator                     | Purpose                          |
| ----------------------------- | -------------------------------- |
| `@ApiProperty({...})`         | Document class property          |
| `@ApiPropertyOptional({...})` | Document optional property       |
| `@ApiHideProperty()`          | Hide property from documentation |

---

## 🔍 Testing in Swagger

### Step 1: Register User

1. Navigate to **Auth** → **POST /auth/register**
2. Click "Try it out"
3. Fill in the request body:
   ```json
   {
     "fullName": "John Doe",
     "email": "john@example.com",
     "password": "password123"
   }
   ```
4. Click "Execute"
5. Save the returned `token`

### Step 2: Authorize

1. Click **🔓 Authorize** button
2. Enter: `Bearer <your-token>`
3. Click "Authorize" button

### Step 3: Test Protected Endpoints

1. All protected endpoints now include your JWT automatically
2. Try any endpoint under different sections

### Example Test Sequence

1. **POST /auth/register** → Get token
2. **POST /auth/login** → Login with email/password
3. **GET /users** → List all users (now with JWT)
4. **POST /groups** → Create a new group
5. **GET /groups/:id** → Get group details

---

## 🌐 Swagger UI Options

The Swagger UI is configured with these options:

```typescript
{
  persistAuthorization: true,    // Keep token after page refresh
  displayOperationId: true,       // Show operation IDs
  filter: true,                   // Enable search/filter
  showRequestHeaders: true,       // Display request headers
  docExpansion: 'list',          // Expand endpoints in list
}
```

You can modify these in `src/main.ts` in the `SwaggerModule.setup()` call.

---

## 📱 Mobile App Integration Example

### Getting Token

```javascript
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});
const { token } = await response.json();
localStorage.setItem('jwt_token', token);
```

### Using Token in Requests

```javascript
const token = localStorage.getItem('jwt_token');
const response = await fetch('http://localhost:3000/users', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

---

## 🔒 Production Considerations

### Before Deploying to Production

1. **Restrict CORS Origins**

   ```typescript
   app.enableCors({
     origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
     credentials: true,
   });
   ```

2. **Disable Swagger in Production (Optional)**

   ```typescript
   if (process.env.NODE_ENV !== 'production') {
     SwaggerModule.setup('api', app, document);
   }
   ```

3. **Change JWT Secret**

   ```
   JWT_SECRET=your-super-secure-random-secret-256-bits
   ```

4. **Use HTTPS Only**
   - Always use HTTPS in production
   - Set secure cookie flags

5. **Rate Limiting**
   - Add rate limiting to prevent brute force
   - Especially on `/auth/login` endpoint

---

## 🐛 Troubleshooting

### Swagger not loading?

- Verify `@nestjs/swagger` is installed: `npm list @nestjs/swagger`
- Check port is correct in URL
- Restart the application

### Decorators not showing up?

- Ensure `reflect-metadata` is imported in `main.ts`
- Rebuild the project: `npm run build`
- Clear node_modules and reinstall if needed

### Authorization not working?

- Verify token is properly formatted: `Bearer <token>`
- Check JWT_SECRET matches in `.env`
- Test token with `/auth/login` first

### Can't test endpoints?

- Ensure backend is running
- Check CORS configuration
- Verify JWT is authorized (click Authorize button)

---

## 📚 Additional Resources

- [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)
- [OpenAPI/Swagger Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)

---

## ✅ Checklist

- [x] Swagger installed and configured
- [x] Auth endpoints documented with examples
- [x] DTOs documented with @ApiProperty
- [x] JWT authentication configured
- [x] Swagger UI accessible at `/api`
- [x] Test endpoints working in Swagger UI

**Your API documentation is now complete and ready to use!** 🎉
