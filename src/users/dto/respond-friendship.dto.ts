import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Statuses } from '../../common/enums';

export class RespondFriendshipDto {
  @ApiProperty()
  @IsEnum(Statuses)
  @IsNotEmpty()
  status: Statuses;
}