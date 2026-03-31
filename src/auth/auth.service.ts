import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { AuthDto } from './dto/auth.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: AuthDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ForbiddenException('User already exists');

    const hash = await argon.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        role: Role.USER,
        name: dto.name,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.name ?? '');
    return {
      ...tokens,
    };
  }

  async login(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new ForbiddenException('Invalid credentials');

    const pwMatches = await argon.verify(user.password, dto.password);
    if (!pwMatches) throw new ForbiddenException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.email, user.role,  user.name ?? '');
    return {
      ...tokens,
      name: user.name,
    };
  }

  async refresh(userId: number, email: string, role: Role, name: string) {
    const tokens = await this.generateTokens(userId, email, role, name);
    return { ...tokens, name };
  }

  private async generateTokens(
    userId: number,
    email: string,
    role: Role,
    name: string,
  ) {
    const payload = { id: userId, email, role, name };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES'),
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES'),
    });

    return { accessToken, refreshToken };
  }
}
