import { IsNotEmpty, IsString, IsLatitude, IsLongitude, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsLatitude()
  @IsNotEmpty()
  latitude: number;

  @IsLongitude()
  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  profileDesc: string;

  @IsArray()
  @IsNotEmpty()
  instruments: [string];

  @IsArray()
  @IsNotEmpty()
  genres: [string];
}