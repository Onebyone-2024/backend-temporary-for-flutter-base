import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto) {
    const client = this.prisma.getPrisma();
    return await client.group.create({
      data: createGroupDto,
      include: {
        members: {
          include: {
            user: { select: { uuid: true, fullName: true, email: true } },
          },
        },
        groupChats: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async findAll() {
    const client = this.prisma.getPrisma();
    return await client.group.findMany({
      include: {
        members: {
          include: {
            user: { select: { uuid: true, fullName: true, email: true } },
          },
        },
        groupChats: { take: 10, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(uuid: string) {
    const client = this.prisma.getPrisma();
    const group = await client.group.findUnique({
      where: { uuid },
      include: {
        members: {
          include: {
            user: { select: { uuid: true, fullName: true, email: true } },
          },
        },
        groupChats: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with UUID ${uuid} not found`);
    }

    return group;
  }

  async update(uuid: string, updateGroupDto: UpdateGroupDto) {
    const client = this.prisma.getPrisma();
    await this.findOne(uuid);

    return await client.group.update({
      where: { uuid },
      data: updateGroupDto,
      include: {
        members: {
          include: {
            user: { select: { uuid: true, fullName: true, email: true } },
          },
        },
        groupChats: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async remove(uuid: string) {
    const client = this.prisma.getPrisma();
    await this.findOne(uuid);

    await client.group.delete({
      where: { uuid },
    });
  }
}
