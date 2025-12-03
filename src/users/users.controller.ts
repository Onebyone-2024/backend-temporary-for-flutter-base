import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Register a new user with email and password',
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      example1: {
        summary: 'Basic user creation',
        value: {
          fullName: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          status: 'Available',
          bio: 'Software developer',
          avatar: 'https://example.com/avatar.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':uuid/chats')
  @ApiOperation({
    summary: 'Get all chats for a user',
    description:
      'Retrieve all chats (direct and group) for a specific user, merged and ordered by last message date. Limited to 200 chats.',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Chats retrieved successfully',
    schema: {
      example: [
        {
          uuid: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John Doe',
          type: 'direct',
          photo: null,
          lastMessage: 'Hello, how are you?',
          lastMessageAt: '2025-12-03T10:30:00.000Z',
        },
        {
          uuid: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Frontend Team',
          type: 'group',
          photo: 'https://example.com/group.jpg',
          lastMessage: 'Meeting at 3pm',
          lastMessageAt: '2025-12-03T09:15:00.000Z',
        },
      ],
    },
  })
  getAllChats(@Param('uuid') uuid: string) {
    return this.usersService.getAllChats(uuid);
  }

  @Get(':uuid')
  @ApiOperation({
    summary: 'Get a specific user',
    description: 'Retrieve a single user by UUID',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
  })
  findOne(@Param('uuid') uuid: string) {
    return this.usersService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOperation({
    summary: 'Update a user',
    description: 'Update user information',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      example1: {
        summary: 'Update user profile',
        value: {
          fullName: 'Jane Doe',
          status: 'Busy',
          bio: 'Updated bio',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  update(@Param('uuid') uuid: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(uuid, updateUserDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Remove a user from the system',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  remove(@Param('uuid') uuid: string) {
    return this.usersService.remove(uuid);
  }
}
