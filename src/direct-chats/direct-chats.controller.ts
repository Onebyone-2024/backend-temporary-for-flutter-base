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
import { DirectChatsService } from './direct-chats.service';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { UpdateDirectChatDto } from './dto/update-direct-chat.dto';
import { SendDirectChatMessageDto } from './dto/send-direct-chat-message.dto';

@Controller('direct-chats')
@ApiTags('Direct Chats')
export class DirectChatsController {
  constructor(private readonly directChatsService: DirectChatsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a direct chat',
    description: 'Create a new direct chat conversation between two users',
  })
  @ApiBody({
    type: CreateDirectChatDto,
    examples: {
      example1: {
        summary: 'Create chat between two users',
        value: {
          uuid1: '550e8400-e29b-41d4-a716-446655440000',
          uuid2: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Direct chat created successfully',
  })
  create(@Body() createDirectChatDto: CreateDirectChatDto) {
    return this.directChatsService.create(createDirectChatDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all direct chats',
    description: 'Retrieve all direct chat conversations',
  })
  @ApiResponse({
    status: 200,
    description: 'List of direct chats retrieved successfully',
  })
  findAll() {
    return this.directChatsService.findAll();
  }

  @Get('between/:uuid1/:uuid2')
  @ApiOperation({
    summary: 'Get direct chat between two users',
    description: 'Retrieve a direct chat conversation between specific users',
  })
  @ApiParam({
    name: 'uuid1',
    type: 'string',
    description: 'First user UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiParam({
    name: 'uuid2',
    type: 'string',
    description: 'Second user UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 200,
    description: 'Direct chat retrieved successfully',
  })
  findByUsers(@Param('uuid1') uuid1: string, @Param('uuid2') uuid2: string) {
    return this.directChatsService.findByUsers(uuid1, uuid2);
  }

  @Get(':uuid')
  @ApiOperation({
    summary: 'Get a specific direct chat',
    description: 'Retrieve a single direct chat by UUID',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'Direct chat UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Direct chat retrieved successfully',
  })
  findOne(@Param('uuid') uuid: string) {
    return this.directChatsService.findOne(uuid);
  }

  @Patch(':uuid')
  @ApiOperation({
    summary: 'Update a direct chat',
    description: 'Update direct chat information',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'Direct chat UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateDirectChatDto,
    examples: {
      example1: {
        summary: 'Update chat metadata',
        value: {
          uuid1: '550e8400-e29b-41d4-a716-446655440000',
          uuid2: '550e8400-e29b-41d4-a716-446655440001',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Direct chat updated successfully',
  })
  update(
    @Param('uuid') uuid: string,
    @Body() updateDirectChatDto: UpdateDirectChatDto,
  ) {
    return this.directChatsService.update(uuid, updateDirectChatDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a direct chat',
    description: 'Remove a direct chat conversation',
  })
  @ApiParam({
    name: 'uuid',
    type: 'string',
    description: 'Direct chat UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Direct chat deleted successfully',
  })
  remove(@Param('uuid') uuid: string) {
    return this.directChatsService.remove(uuid);
  }

  // ========== Direct Chat Messages ==========

  @Post(':directChatUuid/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send a message',
    description: 'Send a new message in a direct chat conversation',
  })
  @ApiParam({
    name: 'directChatUuid',
    type: 'string',
    description: 'Direct chat UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: SendDirectChatMessageDto,
    examples: {
      example1: {
        summary: 'Send a text message',
        value: {
          senderUuid: '550e8400-e29b-41d4-a716-446655440000',
          message: 'Hello! How are you?',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
  })
  sendMessage(
    @Param('directChatUuid') directChatUuid: string,
    @Body() body: SendDirectChatMessageDto,
  ) {
    return this.directChatsService.sendMessage(
      directChatUuid,
      body.senderUuid,
      body.message,
    );
  }

  @Get(':directChatUuid/messages')
  @ApiOperation({
    summary: 'Get chat messages',
    description: 'Retrieve messages from a direct chat conversation',
  })
  @ApiParam({
    name: 'directChatUuid',
    type: 'string',
    description: 'Direct chat UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'limit',
    type: 'number',
    description: 'Number of messages to retrieve (default: 50)',
    required: false,
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    type: 'number',
    description: 'Number of messages to skip (pagination)',
    required: false,
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
  })
  getMessages(
    @Param('directChatUuid') directChatUuid: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

    return this.directChatsService.getMessages(
      directChatUuid,
      parsedLimit,
      parsedOffset,
    );
  }

  @Delete('messages/:messageUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a message',
    description: 'Remove a message from a direct chat conversation',
  })
  @ApiParam({
    name: 'messageUuid',
    type: 'string',
    description: 'Message UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 204,
    description: 'Message deleted successfully',
  })
  deleteMessage(@Param('messageUuid') messageUuid: string) {
    return this.directChatsService.deleteMessage(messageUuid);
  }

  @Patch('messages/:messageUuid')
  @ApiOperation({
    summary: 'Update a message',
    description: 'Edit a message in a direct chat conversation',
  })
  @ApiParam({
    name: 'messageUuid',
    type: 'string',
    description: 'Message UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    description: 'Message content',
    examples: {
      example1: {
        summary: 'Update message text',
        value: {
          message: 'Updated message content',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Message updated successfully',
  })
  updateMessage(
    @Param('messageUuid') messageUuid: string,
    @Body('message') message: string,
  ) {
    return this.directChatsService.updateMessage(messageUuid, message);
  }
}
