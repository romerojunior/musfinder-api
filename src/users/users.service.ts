import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as admin from 'firebase-admin';
import * as geofirestore from 'geofirestore';


@Injectable()
export class UsersService {

  fs = admin.firestore();
  GeoFirestore = geofirestore.initializeApp(this.fs);
  geocollection = this.GeoFirestore.collection('users');

  constructor() {}

  async create(createUserDto: CreateUserDto): Promise<void> {
    await this.geocollection.add({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      profile_description: createUserDto.profile_description,
      genres: createUserDto.genres,
      instruments: createUserDto.instruments,
      coordinates: new admin.firestore.GeoPoint(createUserDto.geolocation.latitude, createUserDto.geolocation.longitude)
    })
  }

  async locate(radius: number, geolocation: any): Promise<any> {
    const firestore = admin.firestore();
    const GeoFirestore = geofirestore.initializeApp(firestore);
    const geocollection = GeoFirestore.collection('users');

    const query = geocollection.near({ center: new admin.firestore.GeoPoint(parseFloat(geolocation.latitude), parseFloat(geolocation.longitude)), radius: Number(radius) });

    const geosnapshot = await query.get()

    const resp = [];

    for (var entry of geosnapshot.docs){
      resp.push({
        distance: `${entry.distance.toFixed(2)} km`,
        ...entry.data()
      });
    }

    return resp
  }


}
