import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('Нет токена');

    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('Нет токена');

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      if (!payload.sub)
        throw new UnauthorizedException('Пользователь не найден');
      req.user = payload; 
      return true;
    } catch (err) {
      throw new UnauthorizedException('Невалидный токен');
    }
  }
}
