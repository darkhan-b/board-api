import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  create(title: string) {
    return this.prisma.board.create({
      data: { title }
    })
  }

  findAll() {
    return this.prisma.board.findMany({
      include: { tasks: true }
    })
  }
}