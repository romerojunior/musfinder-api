import { ApiProperty } from '@nestjs/swagger';

export class Profile {
  @ApiProperty()
  about: string;

  @ApiProperty()
  instruments: [string];

  @ApiProperty()
  genres: [string];
}