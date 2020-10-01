import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Geolocation, UserRelativeToPoint } from './interfaces';
import * as admin from 'firebase-admin';
import * as geofirestore from 'geofirestore';


@Injectable()
export class UsersService {

  fs = admin.firestore();
  GeoFirestore = geofirestore.initializeApp(this.fs);
  geocollection = this.GeoFirestore.collection('users');

  async create(createUserDto: CreateUserDto): Promise<void> {
    await this.geocollection.add({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      profileDesc: createUserDto.profileDesc,
      genres: createUserDto.genres,
      instruments: createUserDto.instruments,
      coordinates: new admin.firestore.GeoPoint(
        createUserDto.latitude,
        createUserDto.longitude
      )
    })
  }

  async locate(radius: number, geolocation: Geolocation): Promise<UserRelativeToPoint[]> {
    const query = this.geocollection.near({
      radius: radius,
      center: new admin.firestore.GeoPoint(
        geolocation.latitude,
        geolocation.longitude
      )
    });

    const geosnapshot = await query.get()

    const resp = [];

    for (var entry of geosnapshot.docs){
      const user = {
        distance: `${entry.distance.toFixed(2)} km`,
        ...entry.data()
      }
      delete user.g;
      resp.push(user);
    }
    return resp
  }

}
