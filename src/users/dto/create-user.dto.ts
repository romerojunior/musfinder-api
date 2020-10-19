import { IsNotEmpty, IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FullnameDto, CoordinatesDto } from './common';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  name: FullnameDto;

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  coordinates: CoordinatesDto;
}