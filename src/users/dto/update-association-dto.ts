import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Tasks } from '../../common/enums';

export class UpdateAssociationDto {
  @ApiProperty()
  @IsEnum(Tasks)
  @IsNotEmpty()
  task: Tasks;
}