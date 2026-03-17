import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@ApiTags('Tasks')
@ApiBearerAuth('access-token')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все задачи' })
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить задачу по ID' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать задачу' })
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateTaskDto, @Req() req: any) {
    if (!req.user || !req.user.sub) {
      throw new BadRequestException('Пользователь не найден в JWT');
    }
    const userId = req.user.sub;
    return this.tasksService.create(dto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить задачу' })
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Req() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.role as Role;
    return this.tasksService.update(+id, dto, userId, userRole);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить задачу' })
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub;
    const userRole = req.user.role as Role;
    return this.tasksService.remove(+id, userId, userRole);
  }
}
