import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    if (!dto.password) throw new BadRequestException('Password is required');

    const hashedPassword = await argon2.hash(dto.password);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
      },
      select: { id: true, email: true, role: true },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true },
    });
  }

  findOne(id?: number) {
    if (!id) throw new BadRequestException('ID пользователя отсутствует');

    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, tasks: true },
    });
  }

  async remove(id?: number) {
    if (!id) throw new BadRequestException('ID пользователя отсутствует');

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');

    return this.prisma.user.delete({
      where: { id },
      select: { id: true, email: true, role: true },
    });
  }
}