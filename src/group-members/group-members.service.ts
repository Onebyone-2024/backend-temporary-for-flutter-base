import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';

@Injectable()
export class GroupMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGroupMemberDto: CreateGroupMemberDto) {
    const { groupUuid, userUuid } = createGroupMemberDto;
    const client = this.prisma.getPrisma();

    // Check if group and user exist
    const group = await client.group.findUnique({ where: { uuid: groupUuid } });
    const user = await client.user.findUnique({ where: { uuid: userUuid } });

    if (!group || !user) {
      throw new NotFoundException('Group or user not found');
    }

    // Check if member already exists
    const existingMember = await client.groupMember.findUnique({
      where: { groupUuid_userUuid: { groupUuid, userUuid } },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this group');
    }

    return await client.groupMember.create({
      data: createGroupMemberDto,
      include: {
        user: { select: { uuid: true, fullName: true, email: true } },
      },
    });
  }

  async findAll() {
    const client = this.prisma.getPrisma();
    return await client.groupMember.findMany({
      include: {
        user: { select: { uuid: true, fullName: true, email: true } },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async findOne(uuid: string) {
    const client = this.prisma.getPrisma();
    const member = await client.groupMember.findUnique({
      where: { uuid },
      include: {
        user: { select: { uuid: true, fullName: true, email: true } },
      },
    });

    if (!member) {
      throw new NotFoundException(`Group member with UUID ${uuid} not found`);
    }

    return member;
  }

  async findGroupMembers(groupUuid: string) {
    const client = this.prisma.getPrisma();
    const group = await client.group.findUnique({ where: { uuid: groupUuid } });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return await client.groupMember.findMany({
      where: { groupUuid },
      include: {
        user: { select: { uuid: true, fullName: true, email: true } },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  async remove(uuid: string) {
    const client = this.prisma.getPrisma();
    await this.findOne(uuid);

    await client.groupMember.delete({
      where: { uuid },
    });
  }

  async removeByGroupAndUser(groupUuid: string, userUuid: string) {
    const client = this.prisma.getPrisma();

    const member = await client.groupMember.findUnique({
      where: { groupUuid_userUuid: { groupUuid, userUuid } },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this group');
    }

    await client.groupMember.delete({
      where: { uuid: member.uuid },
    });
  }
}
