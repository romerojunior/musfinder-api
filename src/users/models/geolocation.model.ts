import { ApiProperty } from '@nestjs/swagger';

export class Geolocation {
  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;
}