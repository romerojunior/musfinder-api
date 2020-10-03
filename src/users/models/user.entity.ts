import { ApiProperty } from '@nestjs/swagger';
import { UserFullname } from './userfullname.entity';
import { Geolocation } from './geolocation.entity';

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