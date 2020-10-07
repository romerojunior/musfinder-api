import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestFriendshipDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user: string;
}