import { IsNotEmpty, IsLatitude, IsLongitude, IsInt } from 'class-validator';

export class QueryUserDto {
  @IsInt()
  @IsNotEmpty()
  radius: number;

  @IsLatitude()
  @IsNotEmpty()
  latitude: number;

  @IsLongitude()
  @IsNotEmpty()
  longitude: number;
}