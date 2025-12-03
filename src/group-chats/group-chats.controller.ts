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
import { GroupChatsService } from './group-chats.service';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { UpdateGroupChatDto } from './dto/update-group-chat.dto';

@Controller('group-chats')
@ApiTags('Group Chats')
export class GroupChatsController {
  constructor(private readonly groupChatsService: GroupChatsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createGroupChatDto: CreateGroupChatDto) {
    return this.groupChatsService.create(createGroupChatDto);
  }

  @Get()
  findAll() {
    return this.groupChatsService.findAll();
  }

  @Get('group/:groupUuid')
  findByGroup(
    @Param('groupUuid') groupUuid: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.groupChatsService.findByGroup(groupUuid, limitNum);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.groupChatsService.findOne(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateGroupChatDto: UpdateGroupChatDto,
  ) {
    return this.groupChatsService.update(uuid, updateGroupChatDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('uuid') uuid: string) {
    return this.groupChatsService.remove(uuid);
  }
}
