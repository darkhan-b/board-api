import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  create(title: string) {
    return this.prisma.board.create({
      data: { title },
    });
  }

  findAll() {
    return this.prisma.board.findMany();
  }

  findOne(id: number) {
    return this.prisma.board.findUnique({
      where: { id },
      include: { tasks: true },
    });
  }

  remove(id: number) {
    return this.prisma.board.delete({
      where: { id },
    });
  }
}