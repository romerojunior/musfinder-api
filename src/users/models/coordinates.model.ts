import { ApiProperty } from '@nestjs/swagger';

export class Coordinates {
  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;
}