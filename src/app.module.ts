import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AppController } from './app.controller'
import { AppService } from './app.service'

import { PrismaModule } from './prisma/prisma.module'
import { BoardsModule } from './boards/boards.module'
import { UsersModule } from './users/users.module'
import { TasksModule } from './tasks/tasks.module'
import { AuthModule } from './auth/auth.module'


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    BoardsModule,
    UsersModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}