import { ApiProperty } from '@nestjs/swagger';
import * as firebase from 'firebase-admin';

export class Friendship {
  @ApiProperty()
  guid?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  from: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt?: string;
}