import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  findAll(status?: TaskStatus) {
    return this.prisma.task.findMany({
      where: status ? { status } : {},
    });
  }

  findOne(id: number) {
    return this.prisma.task.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  create(data: any) {
    return this.prisma.task.create({ data });
  }

  remove(id: number) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}