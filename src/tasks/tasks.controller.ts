import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

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
  create(@Body() dto: CreateTaskDto, @Req() req: any) {
    const userId = req.user?.id; // <-- правильно
    if (!userId) throw new BadRequestException('Пользователь не найден в JWT');
    return this.tasksService.create(dto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить задачу' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Req() req: any) {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) throw new BadRequestException('Пользователь не найден в JWT');
    return this.tasksService.update(+id, dto, userId, role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить задачу' })
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) throw new BadRequestException('Пользователь не найден в JWT');
    return this.tasksService.remove(+id, userId, role);
  }
}
