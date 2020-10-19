import { ApiProperty } from '@nestjs/swagger';

export class Fullname {
  @ApiProperty()
  first: string;

  @ApiProperty()
  last: string;
}