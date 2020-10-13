import { ApiProperty } from '@nestjs/swagger';
import { UserFullname } from './userfullname.model';
import { Geolocation } from './geolocation.model';

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