import { IsNotEmpty, IsString, IsLatitude, IsLongitude, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserFullnameDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  first: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  last: string;
}

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  guid: string;

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  name: UserFullnameDto;

  @ApiProperty()
  @IsLatitude()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty()
  @IsLongitude()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  about: string;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  instruments: [string];

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  genres: [string];
}