import { Controller, Get, Post, Body } from '@nestjs/common'
import { BoardsService } from './boards.service'

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  findAll() {
    return this.boardsService.findAll()
  }

  @Post()
  create(@Body() body: { title: string }) {
    return this.boardsService.create(body.title)
  }
}