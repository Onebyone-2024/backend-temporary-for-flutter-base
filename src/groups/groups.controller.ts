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
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Controller('groups')
@ApiTags('Groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new group',
    description:
      'Create a new group with optional member list. Members array accepts an array of user UUIDs. If a member already exists in the group, they will be ignored.',
  })
  @ApiBody({
    type: CreateGroupDto,
    examples: {
      basic: {
        summary: 'Create group without members',
        value: {
          name: 'Frontend Team',
          photo: 'https://example.com/photo.jpg',
        },
      },
      withMembers: {
        summary: 'Create group with members',
        value: {
          name: 'Frontend Team',
          photo: 'https://example.com/photo.jpg',
          members: ['user-uuid-1', 'user-uuid-2', 'user-uuid-3'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Group created successfully',
  })
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all groups',
    description: 'Retrieve all groups with their members and latest messages',
  })
  @ApiResponse({
    status: 200,
    description: 'List of groups retrieved successfully',
  })
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':uuid')
  @ApiOperation({
    summary: 'Get a specific group',
    description:
      'Retrieve a single group by UUID with all its members and messages',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'Group UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Group retrieved successfully',
  })
  findOne(@Param('uuid') uuid: string) {
    return this.groupsService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOperation({
    summary: 'Update a group',
    description:
      'Update group name or photo (members field will be ignored in update)',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'Group UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateGroupDto,
    examples: {
      example1: {
        summary: 'Update group name and photo',
        value: {
          name: 'Updated Team Name',
          photo: 'https://example.com/new-photo.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Group updated successfully',
  })
  update(@Param('uuid') uuid: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(uuid, updateGroupDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a group',
    description: 'Delete a group and all associated data',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'Group UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Group deleted successfully',
  })
  remove(@Param('uuid') uuid: string) {
    return this.groupsService.remove(uuid);
  }
}
