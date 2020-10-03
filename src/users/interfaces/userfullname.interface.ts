import { ApiProperty } from '@nestjs/swagger';

export class UserFullname {
  @ApiProperty()
  first: string;

  @ApiProperty()
  last: string;
}