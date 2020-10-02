import { IsNotEmpty, IsString, IsLatitude, IsLongitude, IsArray, IsUUID, ValidateNested } from 'class-validator';

export class NameDto {
  @IsString()
  @IsNotEmpty()
  first: string;

  @IsString()
  @IsNotEmpty()
  last: string;
}

export class CreateUserDto {
  @IsUUID()
  @IsNotEmpty()
  guid: string;

  @IsNotEmpty()
  @ValidateNested()
  name: NameDto;

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