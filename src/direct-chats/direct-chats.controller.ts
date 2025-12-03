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
import { ApiTags } from '@nestjs/swagger';
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
  create(@Body() createDirectChatDto: CreateDirectChatDto) {
    return this.directChatsService.create(createDirectChatDto);
  }

  @Get()
  findAll() {
    return this.directChatsService.findAll();
  }

  @Get('between/:uuid1/:uuid2')
  findByUsers(@Param('uuid1') uuid1: string, @Param('uuid2') uuid2: string) {
    return this.directChatsService.findByUsers(uuid1, uuid2);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.directChatsService.findOne(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateDirectChatDto: UpdateDirectChatDto,
  ) {
    return this.directChatsService.update(uuid, updateDirectChatDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('uuid') uuid: string) {
    return this.directChatsService.remove(uuid);
  }

  // ========== Direct Chat Messages ==========

  @Post(':directChatUuid/messages')
  @HttpCode(HttpStatus.CREATED)
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
  deleteMessage(@Param('messageUuid') messageUuid: string) {
    return this.directChatsService.deleteMessage(messageUuid);
  }

  @Patch('messages/:messageUuid')
  updateMessage(
    @Param('messageUuid') messageUuid: string,
    @Body('message') message: string,
  ) {
    return this.directChatsService.updateMessage(messageUuid, message);
  }
}
