import { IsNotEmpty, IsLatitude, IsLongitude, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryUserDto {
  @IsInt()
  @IsNotEmpty()
  @Type(()=>Number)
  radius: number;

  @IsLatitude()
  @IsNotEmpty()
  @Type(()=>Number)
  latitude: number;

  @IsLongitude()
  @IsNotEmpty()
  @Type(()=>Number)
  longitude: number;
}