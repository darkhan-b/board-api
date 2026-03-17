import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Role } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.task.findMany({ include: { user: true, board: true } });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({ where: { id }, include: { user: true, board: true } });
    if (!task) throw new NotFoundException('Задача не найдена');
    return task;
  }

async create(dto: CreateTaskDto, userId: number) {
  if (!userId) throw new BadRequestException('User ID отсутствует');

  const board = await this.prisma.board.findUnique({ where: { id: dto.boardId } });
  if (!board) throw new NotFoundException('Доска не найдена');

  return this.prisma.task.create({
    data: {
      title: dto.title,
      description: dto.description,
      status: dto.status,
      boardId: dto.boardId,
      userId,
    },
  });
}

  async update(id: number, dto: UpdateTaskDto, userId: number, userRole: Role) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Задача не найдена');
    if (task.userId !== userId && userRole !== Role.ADMIN) throw new ForbiddenException('Нет доступа');

    return this.prisma.task.update({ where: { id }, data: dto });
  }

  async remove(id: number, userId: number, userRole: Role) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Задача не найдена');
    if (task.userId !== userId && userRole !== Role.ADMIN) throw new ForbiddenException('Нет доступа');

    return this.prisma.task.delete({ where: { id } });
  }
}