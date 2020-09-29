import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as admin from 'firebase-admin';
import * as geofirestore from 'geofirestore';


@Injectable()
export class UsersService {
  constructor() {}

  async create(createUserDto: CreateUserDto): Promise<void> {
    const firestore = admin.firestore();
    const GeoFirestore = geofirestore.initializeApp(firestore);
    const geocollection = GeoFirestore.collection('users'); //ref

    await geocollection.add({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      coordinates: new admin.firestore.GeoPoint(createUserDto.latitude, createUserDto.longitude)
    })

    return
  }

  async get(radius: number): Promise<void> {
    const firestore = admin.firestore();
    const GeoFirestore = geofirestore.initializeApp(firestore);
    const geocollection = GeoFirestore.collection('users');

    const query = geocollection.near({ center: new admin.firestore.GeoPoint(40.75, -73.98), radius: radius });

    const geosnapshot = await query.get()

    for (var entry of geosnapshot.docs){
      console.log(`Distance: ${entry.distance.toFixed(2)} km`);
      console.log(entry.data());
    }
  }


}
