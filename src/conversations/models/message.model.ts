import { ApiProperty } from '@nestjs/swagger';

export class Message {
  @ApiProperty()
  guid?: string;

  @ApiProperty()
  from: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  createdAt?: string;
}