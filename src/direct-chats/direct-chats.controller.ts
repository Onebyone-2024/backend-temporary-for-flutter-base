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
import { DirectChatsService } from './direct-chats.service';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { UpdateDirectChatDto } from './dto/update-direct-chat.dto';

@Controller('direct-chats')
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
}
