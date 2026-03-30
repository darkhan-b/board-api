import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Role } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.task.findMany({
      include: {
        board: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { user: true, board: true },
    });
    if (!task) throw new NotFoundException('Задача не найдена');
    return task;
  }

  async create(dto: CreateTaskDto, userId: number) {
    return this.prisma.task.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async update(id: number, dto: UpdateTaskDto, userId: number, role: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Задача не найдена');

    // Приводим роль из JWT к enum Role
    const userRole: Role = role as Role;

    if (task.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Нет прав для редактирования');
    }

    return this.prisma.task.update({ where: { id }, data: dto });
  }

  async remove(id: number, userId: number, role: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Задача не найдена');

    const userRole: Role = role as Role;

    if (task.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('Нет прав для удаления');
    }

    return this.prisma.task.delete({ where: { id } });
  }
}
