import { IsNotEmpty, IsString, IsLatitude, IsLongitude } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FullnameDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  first: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  last: string;
}

export class CoordinatesDto {
  @ApiProperty()
  @IsLatitude()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty()
  @IsLongitude()
  @IsNotEmpty()
  longitude: number;
}