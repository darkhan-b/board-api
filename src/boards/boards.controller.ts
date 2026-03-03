import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { AuthGuard } from '@nestjs/passport';


@ApiTags('Boards')
@ApiBearerAuth('access-token')

@UseGuards(AuthGuard('jwt'))
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все доски' })
  findAll() {
    return this.boardsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить доску с задачами' })
  findOne(@Param('id') id: string) {
    return this.boardsService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать доску' })
  create(@Body() dto: CreateBoardDto) {
    return this.boardsService.create(dto.title);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить доску' })
  remove(@Param('id') id: string) {
    return this.boardsService.remove(+id);
  }
}