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
}
