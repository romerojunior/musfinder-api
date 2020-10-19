import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
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