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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { GroupChatsService } from './group-chats.service';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { UpdateGroupChatDto } from './dto/update-group-chat.dto';

@Controller('group-chats')
@ApiTags('Group Chats')
export class GroupChatsController {
  constructor(private readonly groupChatsService: GroupChatsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a group chat message',
    description: 'Post a new message to a group chat',
  })
  @ApiBody({
    type: CreateGroupChatDto,
    examples: {
      example1: {
        summary: 'Send a message',
        value: {
          textMessage: 'Hello everyone!',
          createdBy: '550e8400-e29b-41d4-a716-446655440000',
          groupUuid: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Message created successfully',
  })
  create(@Body() createGroupChatDto: CreateGroupChatDto) {
    return this.groupChatsService.create(createGroupChatDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all group chat messages',
    description: 'Retrieve all messages from all group chats',
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
  })
  findAll() {
    return this.groupChatsService.findAll();
  }

  @Get('group/:groupUuid')
  @ApiOperation({
    summary: 'Get messages for a specific group',
    description: 'Retrieve all messages from a specific group chat',
  })
  @ApiParam({
    name: 'groupUuid',
    type: 'string',
    description: 'Group UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'Number of messages to retrieve (default: 50)',
    required: false,
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
  })
  findByGroup(
    @Param('groupUuid') groupUuid: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.groupChatsService.findByGroup(groupUuid, limitNum);
  }

  @Get(':uuid')
  @ApiOperation({
    summary: 'Get a specific message',
    description: 'Retrieve a single message by UUID',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'Message UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Message retrieved successfully',
  })
  findOne(@Param('uuid') uuid: string) {
    return this.groupChatsService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOperation({
    summary: 'Update a message',
    description: 'Edit a group chat message',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'Message UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateGroupChatDto,
    examples: {
      example1: {
        summary: 'Update message text',
        value: {
          textMessage: 'Updated message content',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Message updated successfully',
  })
  update(
    @Param('uuid') uuid: string,
    @Body() updateGroupChatDto: UpdateGroupChatDto,
  ) {
    return this.groupChatsService.update(uuid, updateGroupChatDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a message',
    description: 'Remove a group chat message',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'Message UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Message deleted successfully',
  })
  remove(@Param('uuid') uuid: string) {
    return this.groupChatsService.remove(uuid);
  }
}
