import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users retrieved successfully',
    schema: {
      example: [
        {
          uuid: '550e8400-e29b-41d4-a716-446655440000',
          email: 'john@example.com',
          fullName: 'John Doe',
          createdAt: '2025-12-02T10:00:00.000Z',
        },
        {
          uuid: '550e8400-e29b-41d4-a716-446655440001',
          email: 'jane@example.com',
          fullName: 'Jane Smith',
          createdAt: '2025-12-03T10:00:00.000Z',
        },
      ],
    },
  })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
