import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto) {
    const { members, ...groupData } = createGroupDto;
    const client = this.prisma.getPrisma();

    // Create the group
    const group = await client.group.create({
      data: groupData,
      include: {
        members: {
          include: {
            user: { select: { uuid: true, fullName: true, email: true } },
          },
        },
        groupChats: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    // If members array is provided, add them to the group
    if (members && members.length > 0) {
      for (const userUuid of members) {
        try {
          // Check if user exists
          const user = await client.user.findUnique({
            where: { uuid: userUuid },
          });

          if (user) {
            // Check if member already exists in group
            const existingMember = await client.groupMember.findUnique({
              where: {
                groupUuid_userUuid: {
                  groupUuid: group.uuid,
                  userUuid,
                },
              },
            });

            // Create member only if they don't already exist
            if (!existingMember) {
              await client.groupMember.create({
                data: {
                  groupUuid: group.uuid,
                  userUuid,
                },
              });
            }
          }
        } catch (error) {
          // Silently skip if user doesn't exist or member creation fails
          continue;
        }
      }
    }

    // Fetch and return the updated group with all members
    return await client.group.findUnique({
      where: { uuid: group.uuid },
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { members, ...updateData } = updateGroupDto;
    const client = this.prisma.getPrisma();
    await this.findOne(uuid);

    return await client.group.update({
      where: { uuid },
      data: updateData,
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
