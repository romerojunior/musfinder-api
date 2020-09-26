import { read } from 'fs';
import { Geolocation } from './geolocation.interface';

export interface User {
  readonly name: string;
  readonly geolocation: Geolocation;
}