import { IsNotEmpty, IsLatitude, IsLongitude, IsInt, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchUserDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  radius: number;

  @ApiProperty()
  @IsLatitude()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty()
  @IsLongitude()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({required: false})
  @IsArray()
  @IsOptional()
  instruments?: string[];

  @ApiProperty({required: false})
  @IsArray()
  @IsOptional()
  genres?: string[];
}