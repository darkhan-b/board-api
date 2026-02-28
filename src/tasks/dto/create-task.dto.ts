import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty()
  boardId: number;

  @ApiProperty()
  userId: number;
}