import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { UpdateDirectChatDto } from './dto/update-direct-chat.dto';

@Injectable()
export class DirectChatsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDirectChatDto: CreateDirectChatDto) {
    const { uuid1, uuid2 } = createDirectChatDto;

    if (uuid1 === uuid2) {
      throw new BadRequestException(
        'Cannot create direct chat with the same user',
      );
    }

    const client = this.prisma.getPrisma();

    // Check if users exist
    const user1 = await client.user.findUnique({ where: { uuid: uuid1 } });
    const user2 = await client.user.findUnique({ where: { uuid: uuid2 } });

    if (!user1 || !user2) {
      throw new NotFoundException('One or both users not found');
    }

    // Check if direct chat already exists (either direction)
    const existingChat = await client.directChat.findFirst({
      where: {
        OR: [
          { uuid1, uuid2 },
          { uuid1: uuid2, uuid2: uuid1 },
        ],
      },
    });

    if (existingChat) {
      throw new BadRequestException(
        'Direct chat between these users already exists',
      );
    }

    return await client.directChat.create({
      data: { uuid1, uuid2 },
      include: {
        user1: { select: { uuid: true, fullName: true, email: true } },
        user2: { select: { uuid: true, fullName: true, email: true } },
      },
    });
  }

  async findAll() {
    const client = this.prisma.getPrisma();
    return await client.directChat.findMany({
      include: {
        user1: { select: { uuid: true, fullName: true, email: true } },
        user2: { select: { uuid: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(uuid: string) {
    const client = this.prisma.getPrisma();
    const directChat = await client.directChat.findUnique({
      where: { uuid },
      include: {
        user1: { select: { uuid: true, fullName: true, email: true } },
        user2: { select: { uuid: true, fullName: true, email: true } },
        messages: true,
      },
    });

    if (!directChat) {
      throw new NotFoundException(`Direct chat with UUID ${uuid} not found`);
    }

    return directChat;
  }

  async findByUsers(uuid1: string, uuid2: string) {
    const client = this.prisma.getPrisma();
    return await client.directChat.findFirst({
      where: {
        OR: [
          { uuid1, uuid2 },
          { uuid1: uuid2, uuid2: uuid1 },
        ],
      },
      include: {
        user1: { select: { uuid: true, fullName: true, email: true } },
        user2: { select: { uuid: true, fullName: true, email: true } },
      },
    });
  }

  async update(uuid: string, updateDirectChatDto: UpdateDirectChatDto) {
    const client = this.prisma.getPrisma();
    await this.findOne(uuid);

    return await client.directChat.update({
      where: { uuid },
      data: updateDirectChatDto,
      include: {
        user1: { select: { uuid: true, fullName: true, email: true } },
        user2: { select: { uuid: true, fullName: true, email: true } },
      },
    });
  }

  async remove(uuid: string) {
    const client = this.prisma.getPrisma();
    await this.findOne(uuid);

    await client.directChat.delete({
      where: { uuid },
    });
  }

  // ========== Direct Chat Messages ==========

  async sendMessage(
    directChatUuid: string,
    senderUuid: string,
    message: string,
  ) {
    const client = this.prisma.getPrisma();

    // Verify direct chat exists
    const directChat = await client.directChat.findUnique({
      where: { uuid: directChatUuid },
    });

    if (!directChat) {
      throw new NotFoundException(
        `Direct chat with UUID ${directChatUuid} not found`,
      );
    }

    // Verify sender is part of this direct chat
    if (directChat.uuid1 !== senderUuid && directChat.uuid2 !== senderUuid) {
      throw new BadRequestException('Sender is not part of this direct chat');
    }

    // Verify sender exists
    const sender = await client.user.findUnique({
      where: { uuid: senderUuid },
    });

    if (!sender) {
      throw new NotFoundException(`User with UUID ${senderUuid} not found`);
    }

    // Create the message
    return await client.directChatMessage.create({
      data: {
        directChatUuid,
        senderUuid,
        message,
      },
      include: {
        sender: {
          select: { uuid: true, fullName: true, email: true },
        },
        directChat: {
          select: {
            uuid: true,
            user1: { select: { uuid: true, fullName: true } },
            user2: { select: { uuid: true, fullName: true } },
          },
        },
      },
    });
  }

  async getMessages(
    directChatUuid: string,
    limit: number = 50,
    offset: number = 0,
  ) {
    const client = this.prisma.getPrisma();

    // Verify direct chat exists
    const directChat = await client.directChat.findUnique({
      where: { uuid: directChatUuid },
    });

    if (!directChat) {
      throw new NotFoundException(
        `Direct chat with UUID ${directChatUuid} not found`,
      );
    }

    const messages = await client.directChatMessage.findMany({
      where: { directChatUuid },
      include: {
        sender: {
          select: { uuid: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
    });

    const total = await client.directChatMessage.count({
      where: { directChatUuid },
    });

    return {
      messages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async deleteMessage(messageUuid: string) {
    const client = this.prisma.getPrisma();

    const message = await client.directChatMessage.findUnique({
      where: { uuid: messageUuid },
    });

    if (!message) {
      throw new NotFoundException(`Message with UUID ${messageUuid} not found`);
    }

    await client.directChatMessage.delete({
      where: { uuid: messageUuid },
    });
  }

  async updateMessage(messageUuid: string, newMessage: string) {
    const client = this.prisma.getPrisma();

    const message = await client.directChatMessage.findUnique({
      where: { uuid: messageUuid },
    });

    if (!message) {
      throw new NotFoundException(`Message with UUID ${messageUuid} not found`);
    }

    return await client.directChatMessage.update({
      where: { uuid: messageUuid },
      data: { message: newMessage },
      include: {
        sender: {
          select: { uuid: true, fullName: true, email: true },
        },
      },
    });
  }
}
