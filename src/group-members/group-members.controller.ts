import {
  Controller,
  Get,
  Post,
  Body,
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
import { GroupMembersService } from './group-members.service';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';

@Controller('group-members')
@ApiTags('Group Members')
export class GroupMembersController {
  constructor(private readonly groupMembersService: GroupMembersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add a member to a group',
    description: 'Add a user as a member to a group',
  })
  @ApiBody({
    type: CreateGroupMemberDto,
    examples: {
      example1: {
        summary: 'Add user to group',
        value: {
          groupUuid: '550e8400-e29b-41d4-a716-446655440000',
          userUuid: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Member added successfully',
  })
  create(@Body() createGroupMemberDto: CreateGroupMemberDto) {
    return this.groupMembersService.create(createGroupMemberDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all group members',
    description: 'Retrieve all group members across all groups',
  })
  @ApiResponse({
    status: 200,
    description: 'Members retrieved successfully',
  })
  findAll() {
    return this.groupMembersService.findAll();
  }

  @Get('group/:groupUuid')
  @ApiOperation({
    summary: 'Get members of a group',
    description: 'Retrieve all members of a specific group',
  })
  @ApiParam({
    name: 'groupUuid',
    type: 'string',
    description: 'Group UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Members retrieved successfully',
  })
  findGroupMembers(@Param('groupUuid') groupUuid: string) {
    return this.groupMembersService.findGroupMembers(groupUuid);
  }

  @Get(':uuid')
  @ApiOperation({
    summary: 'Get a specific member',
    description: 'Retrieve a specific group member by UUID',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'Member UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Member retrieved successfully',
  })
  findOne(@Param('uuid') uuid: string) {
    return this.groupMembersService.findOne(uuid);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove a member by member UUID',
    description: 'Remove a member from a group using member UUID',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'Member UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Member removed successfully',
  })
  remove(@Param('uuid') uuid: string) {
    return this.groupMembersService.remove(uuid);
  }

  @Delete('group/:groupUuid/user/:userUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove a user from a group',
    description: 'Remove a specific user from a group by their UUIDs',
  })
  @ApiParam({
    name: 'groupUuid',
    type: 'string',
    description: 'Group UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'userUuid',
    type: 'string',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 204,
    description: 'User removed from group successfully',
  })
  removeByGroupAndUser(
    @Param('groupUuid') groupUuid: string,
    @Param('userUuid') userUuid: string,
  ) {
    return this.groupMembersService.removeByGroupAndUser(groupUuid, userUuid);
  }
}
