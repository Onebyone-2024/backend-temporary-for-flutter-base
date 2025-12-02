import { Module } from '@nestjs/common';
import { DirectChatsController } from './direct-chats.controller';
import { DirectChatsService } from './direct-chats.service';

@Module({
  controllers: [DirectChatsController],
  providers: [DirectChatsService],
  exports: [DirectChatsService],
})
export class DirectChatsModule {}
