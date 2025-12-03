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
import { ApiTags } from '@nestjs/swagger';
import { GroupMembersService } from './group-members.service';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';

@Controller('group-members')
@ApiTags('Group Members')
export class GroupMembersController {
  constructor(private readonly groupMembersService: GroupMembersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createGroupMemberDto: CreateGroupMemberDto) {
    return this.groupMembersService.create(createGroupMemberDto);
  }

  @Get()
  findAll() {
    return this.groupMembersService.findAll();
  }

  @Get('group/:groupUuid')
  findGroupMembers(@Param('groupUuid') groupUuid: string) {
    return this.groupMembersService.findGroupMembers(groupUuid);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.groupMembersService.findOne(uuid);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('uuid') uuid: string) {
    return this.groupMembersService.remove(uuid);
  }

  @Delete('group/:groupUuid/user/:userUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeByGroupAndUser(
    @Param('groupUuid') groupUuid: string,
    @Param('userUuid') userUuid: string,
  ) {
    return this.groupMembersService.removeByGroupAndUser(groupUuid, userUuid);
  }
}
