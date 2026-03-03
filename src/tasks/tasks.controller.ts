import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from '@prisma/client';

@ApiTags('Tasks')
@ApiBearerAuth('access-token')

@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все задачи (можно фильтровать по status)' })
  findAll(@Query('status') status?: TaskStatus) {
    return this.tasksService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить задачу с пользователем' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать задачу' })
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить задачу' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(+id);
  }
}