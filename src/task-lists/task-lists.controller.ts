import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TaskListsService } from './task-lists.service';
import { CreateTaskListDto } from './dto/create-task-list.dto';
import { UpdateTaskListDto } from './dto/update-task-list.dto';

@Controller('task-lists')
export class TaskListsController {
  constructor(private readonly taskListsService: TaskListsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTaskListDto: CreateTaskListDto) {
    return this.taskListsService.create(createTaskListDto);
  }

  @Get()
  findAll() {
    return this.taskListsService.findAll();
  }

  @Get('user/:uuidUser')
  findByUser(@Param('uuidUser') uuidUser: string) {
    return this.taskListsService.findByUser(uuidUser);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.taskListsService.findOne(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid') uuid: string,
    @Body() updateTaskListDto: UpdateTaskListDto,
  ) {
    return this.taskListsService.update(uuid, updateTaskListDto);
  }

  @Delete(':uuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('uuid') uuid: string) {
    return this.taskListsService.remove(uuid);
  }
}
