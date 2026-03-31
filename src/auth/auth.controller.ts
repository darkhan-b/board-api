import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  ForbiddenException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import express from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { Public } from './decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwt: JwtService,
  ) {}

  private setCookie(res: express.Response, token: string) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }
  @Public()
  @Post('register')
  async register(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const tokens = await this.authService.register(dto);
    this.setCookie(res, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
      name: dto.name,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const tokens = await this.authService.login(dto);
    this.setCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken, name: dto.name };
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const token = req.cookies?.refreshToken;
    if (!token) throw new ForbiddenException('No refresh token');

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const tokens = await this.authService.refresh(
        payload.id,
        payload.email,
        payload.role,
        payload.name,
      );
      this.setCookie(res, tokens.refreshToken);

      return { accessToken: tokens.accessToken, name: tokens.name ?? '' };
    } catch {
      throw new ForbiddenException('Invalid refresh token');
    }
  }

  @Public()
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: express.Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
    return { message: 'Logged out' };
  }
}
