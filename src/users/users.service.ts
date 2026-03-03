import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        tasks: true,
      },
    });
  }

  create(data: any) {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
      },
    });
  }
}