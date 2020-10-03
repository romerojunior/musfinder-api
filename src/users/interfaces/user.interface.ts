import { ApiProperty } from '@nestjs/swagger';
import { UserFullname } from './userfullname.interface';
import { Geolocation } from './geolocation.interface';

export class User {
  @ApiProperty()
  guid?: string;

  @ApiProperty()
  distance?: string;

  @ApiProperty()
  coordinates?: Geolocation;

  @ApiProperty()
  name: UserFullname;

  @ApiProperty()
  about: string;

  @ApiProperty()
  instruments: [string];

  @ApiProperty()
  genres: [string];
}