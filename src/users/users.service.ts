import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
}
