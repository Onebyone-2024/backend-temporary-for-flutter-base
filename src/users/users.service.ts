import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserChatsResponseDto } from './dto/user-chats-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const client = this.prisma.getPrisma();
    return await client.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    const client = this.prisma.getPrisma();
    return await client.user.findMany({
      select: {
        uuid: true,
        fullName: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async findOne(uuid: string) {
    const client = this.prisma.getPrisma();
    const user = await client.user.findUnique({
      where: { uuid },
      select: {
        uuid: true,
        fullName: true,
        email: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with UUID ${uuid} not found`);
    }

    return user;
  }

  async findOneByEmail(email: string) {
    const client = this.prisma.getPrisma();
    const user = await client.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(uuid: string, updateUserDto: UpdateUserDto) {
    const client = this.prisma.getPrisma();
    await this.findOne(uuid); // Check if exists

    return await client.user.update({
      where: { uuid },
      data: updateUserDto,
    });
  }

  async remove(uuid: string) {
    const client = this.prisma.getPrisma();
    await this.findOne(uuid); // Check if exists

    await client.user.delete({
      where: { uuid },
    });
  }

  async getAllChats(userUuid: string): Promise<UserChatsResponseDto[]> {
    const client = this.prisma.getPrisma();

    // Verify user exists
    await this.findOne(userUuid);

    // Get all direct chats for the user
    const directChats = await client.directChat.findMany({
      where: {
        OR: [{ uuid1: userUuid }, { uuid2: userUuid }],
      },
      include: {
        user1: {
          select: { uuid: true, fullName: true },
        },
        user2: {
          select: { uuid: true, fullName: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            message: true,
            createdAt: true,
          },
        },
      },
    });

    // Get all groups where user is a member
    const groupMembers = await client.groupMember.findMany({
      where: { userUuid },
      include: {
        group: {
          include: {
            groupChats: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                textMessage: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    // Transform direct chats
    const directChatsList: UserChatsResponseDto[] = directChats.map((chat) => {
      const otherUser = chat.uuid1 === userUuid ? chat.user2 : chat.user1;
      const lastMessage = chat.messages[0];

      return {
        uuid: chat.uuid,
        name: otherUser.fullName,
        type: 'direct' as const,
        photo: undefined,
        lastMessage: lastMessage?.message || undefined,
        lastMessageAt: lastMessage?.createdAt || chat.createdAt,
      };
    });

    // Transform group chats
    const groupChatsList: UserChatsResponseDto[] = groupMembers.map(
      (member) => {
        const lastMessage = member.group.groupChats[0];

        return {
          uuid: member.group.uuid,
          name: member.group.name,
          type: 'group' as const,
          photo: member.group.photo || undefined,
          lastMessage: lastMessage?.textMessage || undefined,
          lastMessageAt: lastMessage?.createdAt || member.group.createdAt,
        };
      },
    );

    // Merge and sort by last message date
    const allChats = [...directChatsList, ...groupChatsList]
      .sort((a, b) => {
        const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      })
      .slice(0, 200); // Limit to 200 chats

    return allChats;
  }
}
