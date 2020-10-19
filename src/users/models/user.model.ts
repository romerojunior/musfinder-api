import { ApiProperty } from '@nestjs/swagger';
import { Fullname } from './fullname.model';
import { Coordinates } from './coordinates.model';
import { Profile } from './profile.model';

export class User {
  @ApiProperty()
  guid?: string;

  @ApiProperty()
  distance?: string;

  @ApiProperty()
  coordinates?: Coordinates;

  @ApiProperty()
  name: Fullname;

  @ApiProperty()
  profile?: Profile;
}