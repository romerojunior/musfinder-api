import { Double } from "typeorm";

export class CreateUserDto {
  firstName: string;
  lastName: string;
  latitude: number;
  longitude: number;
}