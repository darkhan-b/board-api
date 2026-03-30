import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    if (!dto.email) {
      throw new BadRequestException('Email обязателен');
    }

    if (!dto.password) {
      throw new BadRequestException('Password обязателен');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException(
        'Пользователь с таким email уже существует',
      );
    }

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

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: { id: true, email: true, role: true },
    });

    if (!users.length) {
      throw new NotFoundException('Пользователи не найдены');
    }

    return users;
  }

  async findOne(id?: number) {
    if (!id) {
      throw new BadRequestException('ID пользователя отсутствует');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, tasks: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async remove(id?: number) {
    if (!id) {
      throw new BadRequestException('ID пользователя отсутствует');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return this.prisma.user.delete({
      where: { id },
      select: { id: true, email: true, role: true },
    });
  }
}
