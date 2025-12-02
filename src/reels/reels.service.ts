import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReelDto } from './dto/create-reel.dto';
import { UpdateReelDto } from './dto/update-reel.dto';

@Injectable()
export class ReelsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createReelDto: CreateReelDto) {
    const { createdBy } = createReelDto;
    const client = this.prisma.getPrisma();

    // Check if user exists
    const user = await client.user.findUnique({ where: { uuid: createdBy } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await client.reel.create({
      data: createReelDto,
      include: {
        creator: { select: { uuid: true, fullName: true, email: true } },
      },
    });
  }

  async findAll() {
    const client = this.prisma.getPrisma();
    return await client.reel.findMany({
      include: {
        creator: { select: { uuid: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(uuid: string) {
    const client = this.prisma.getPrisma();
    const reel = await client.reel.findUnique({
      where: { uuid },
      include: {
        creator: { select: { uuid: true, fullName: true, email: true } },
      },
    });

    if (!reel) {
      throw new NotFoundException(`Reel with UUID ${uuid} not found`);
    }

    return reel;
  }

  async findByUser(createdBy: string) {
    const client = this.prisma.getPrisma();

    const user = await client.user.findUnique({ where: { uuid: createdBy } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await client.reel.findMany({
      where: { createdBy },
      include: {
        creator: { select: { uuid: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(uuid: string, updateReelDto: UpdateReelDto) {
    const client = this.prisma.getPrisma();
    await this.findOne(uuid);

    return await client.reel.update({
      where: { uuid },
      data: updateReelDto,
      include: {
        creator: { select: { uuid: true, fullName: true, email: true } },
      },
    });
  }

  async remove(uuid: string) {
    const client = this.prisma.getPrisma();
    await this.findOne(uuid);

    await client.reel.delete({
      where: { uuid },
    });
  }
}
