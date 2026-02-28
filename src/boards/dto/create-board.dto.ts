import { ApiProperty } from '@nestjs/swagger';

export class CreateBoardDto {
  @ApiProperty()
  title: string;
}