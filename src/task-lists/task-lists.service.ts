import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskListDto } from './dto/create-task-list.dto';
import { UpdateTaskListDto } from './dto/update-task-list.dto';

@Injectable()
export class TaskListsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskListDto: CreateTaskListDto) {
    const { uuidUser } = createTaskListDto;
    const client = this.prisma.getPrisma();

    // Check if user exists
    const user = await client.user.findUnique({ where: { uuid: uuidUser } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await client.taskList.create({
      data: createTaskListDto,
      include: {
        user: { select: { uuid: true, fullName: true, email: true } },
      },
    });
  }

  async findAll() {
    const client = this.prisma.getPrisma();
    return await client.taskList.findMany({
      include: {
        user: { select: { uuid: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(uuid: string) {
    const client = this.prisma.getPrisma();
    const taskList = await client.taskList.findUnique({
      where: { uuid },
      include: {
        user: { select: { uuid: true, fullName: true, email: true } },
      },
    });

    if (!taskList) {
      throw new NotFoundException(`Task with UUID ${uuid} not found`);
    }

    return taskList;
  }

  async findByUser(uuidUser: string) {
    const client = this.prisma.getPrisma();

    const user = await client.user.findUnique({ where: { uuid: uuidUser } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await client.taskList.findMany({
      where: { uuidUser },
      include: {
        user: { select: { uuid: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(uuid: string, updateTaskListDto: UpdateTaskListDto) {
    const client = this.prisma.getPrisma();
    await this.findOne(uuid);

    return await client.taskList.update({
      where: { uuid },
      data: updateTaskListDto,
      include: {
        user: { select: { uuid: true, fullName: true, email: true } },
      },
    });
  }

  async remove(uuid: string) {
    const client = this.prisma.getPrisma();
    await this.findOne(uuid);

    await client.taskList.delete({
      where: { uuid },
    });
  }
}
