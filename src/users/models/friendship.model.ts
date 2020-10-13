import { ApiProperty } from '@nestjs/swagger';

export class Friendship {
  @ApiProperty()
  guid?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  from: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt?: string;
}