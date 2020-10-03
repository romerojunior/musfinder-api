import { IsNotEmpty, IsLatitude, IsLongitude, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryUserDto {
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
}