import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { UpdateGroupChatDto } from './dto/update-group-chat.dto';

@Injectable()
export class GroupChatsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGroupChatDto: CreateGroupChatDto) {
    const { groupUuid, createdBy } = createGroupChatDto;
    const client = this.prisma.getPrisma();

    // Check if group and user exist
    const group = await client.group.findUnique({ where: { uuid: groupUuid } });
    const user = await client.user.findUnique({ where: { uuid: createdBy } });

    if (!group || !user) {
      throw new NotFoundException('Group or user not found');
    }

    return await client.groupChat.create({
      data: createGroupChatDto,
      include: {
        creator: { select: { uuid: true, fullName: true, email: true } },
        group: { select: { uuid: true, name: true } },
      },
    });
  }

  async findAll() {
    const client = this.prisma.getPrisma();
    return await client.groupChat.findMany({
      include: {
        creator: { select: { uuid: true, fullName: true, email: true } },
        group: { select: { uuid: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(uuid: string) {
    const client = this.prisma.getPrisma();
    const groupChat = await client.groupChat.findUnique({
      where: { uuid },
      include: {
        creator: { select: { uuid: true, fullName: true, email: true } },
        group: { select: { uuid: true, name: true } },
      },
    });

    if (!groupChat) {
      throw new NotFoundException(`Group chat with UUID ${uuid} not found`);
    }

    return groupChat;
  }

  async findByGroup(groupUuid: string, limit = 50) {
    const client = this.prisma.getPrisma();

    const group = await client.group.findUnique({ where: { uuid: groupUuid } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return await client.groupChat.findMany({
      where: { groupUuid },
      include: {
        creator: { select: { uuid: true, fullName: true, email: true } },
        group: { select: { uuid: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async update(uuid: string, updateGroupChatDto: UpdateGroupChatDto) {
    const client = this.prisma.getPrisma();
    await this.findOne(uuid);

    return await client.groupChat.update({
      where: { uuid },
      data: updateGroupChatDto,
      include: {
        creator: { select: { uuid: true, fullName: true, email: true } },
        group: { select: { uuid: true, name: true } },
      },
    });
  }

  async remove(uuid: string) {
    const client = this.prisma.getPrisma();
    await this.findOne(uuid);

    await client.groupChat.delete({
      where: { uuid },
    });
  }
}
