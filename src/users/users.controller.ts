import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Authorized } from '../auth/decorators/authorized.decorator';
import { AuthorizedUser } from '../auth/decorators/authorized-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить всех пользователей' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Получить данные текущего пользователя' })
  me(@AuthorizedUser() user: any) {
    return this.usersService.findOne(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя с задачами' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать пользователя' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить пользователя (только ADMIN)' })
  async remove(
    @Param('id') id: string,
    @AuthorizedUser() user: any, 
  ) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Нет прав на удаление пользователя');
    }
    return this.usersService.remove(+id);
  }
}
