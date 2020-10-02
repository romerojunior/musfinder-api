import { IsNotEmpty, IsString, IsLatitude, IsLongitude, IsArray, IsDate, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  @IsNotEmpty()
  guid: string;

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
  about: string;

  @IsArray()
  @IsNotEmpty()
  instruments: [string];

  @IsArray()
  @IsNotEmpty()
  genres: [string];
}