import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Geolocation } from './interfaces';
import * as admin from 'firebase-admin';
import * as geofirestore from 'geofirestore';


@Injectable()
export class UsersService {

  fs = admin.firestore();
  GeoFirestore = geofirestore.initializeApp(this.fs);
  geocollection = this.GeoFirestore.collection('users');

  async create(createUserDto: CreateUserDto): Promise<void> {
    console.log(createUserDto);
    await this.geocollection.add({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      profile_description: createUserDto.profile_description,
      genres: createUserDto.genres,
      instruments: createUserDto.instruments,
      coordinates: new admin.firestore.GeoPoint(
        createUserDto.latitude,
        createUserDto.longitude
      )
    })
  }

  async locate(radius: number, geolocation: Geolocation): Promise<any> {
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
      const a = {
        distance: `${entry.distance.toFixed(2)} km`,
        ...entry.data()
      }
      delete a.g;
      resp.push(a);
    }
    return resp
  }

}
