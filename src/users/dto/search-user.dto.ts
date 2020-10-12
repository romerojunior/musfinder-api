import { IsNotEmpty, ValidateNested, IsInt, IsArray, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CoordinatesDto } from './common';

export class SearchUserDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  radius: number;

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  coordinates: CoordinatesDto;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  instruments?: string[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(1)
  genres?: string[];
}