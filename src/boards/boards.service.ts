import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  async create(title: string) {
    try {
      return await this.prisma.board.create({ data: { title } });
    } catch (err) {
      console.error('Prisma create board error:', err);
      throw err;
    }
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

  update(id: number, title: string) {
    return this.prisma.board.update({ where: { id }, data: { title } });
  }

  remove(id: number) {
    return this.prisma.board.delete({ where: { id } });
  }
}
