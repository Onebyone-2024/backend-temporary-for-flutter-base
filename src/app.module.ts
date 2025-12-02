import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DirectChatsModule } from './direct-chats/direct-chats.module';
import { GroupsModule } from './groups/groups.module';
import { GroupMembersModule } from './group-members/group-members.module';
import { GroupChatsModule } from './group-chats/group-chats.module';
import { ReelsModule } from './reels/reels.module';
import { TaskListsModule } from './task-lists/task-lists.module';

@Module({
  imports: [
    // Configuration Module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Prisma Module (Global)
    PrismaModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    DirectChatsModule,
    GroupsModule,
    GroupMembersModule,
    GroupChatsModule,
    ReelsModule,
    TaskListsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
