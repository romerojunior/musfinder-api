import { IsString, IsLatitude, IsLongitude, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsString()
  profile_description: string;

  @IsArray()
  instruments: [string];

  @IsArray()
  genres: [string];
}