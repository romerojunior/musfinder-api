import { IsNotEmpty, IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FullNameDto, CoordinatesDto } from './common';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  name: FullNameDto;

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  coordinates: CoordinatesDto;

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